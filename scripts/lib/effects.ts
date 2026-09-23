import { readdirSync, copyFileSync, existsSync } from "fs";
import { join, basename } from "path";
import {
  EFFECTS_DIR, THUMB_SRC, THUMB_DEST,
  type Entry, entries, findEntry, parseXml, read, resolveStr, ensureDir,
} from "./apk";

export interface Choice {
  label: string;
  value: string;
}

export interface Param {
  type: string;
  id: string;
  label: string;
  default?: string;
  unit?: string;
  min?: string;
  max?: string;
  step?: string;
  ticks?: string;
  logscale?: boolean;
  snap?: boolean;
  multiplier?: string;
  bias?: boolean;
  alpha?: string;
  choices?: Choice[];
}

export interface Effect {
  slug: string;
  id: string;
  name: string;
  desc: string;
  category: string;
  tags: string[];
  thumb: string | null;
  thumbName?: string;
  params: Param[];
  affinity?: string;
  experimental: boolean;
  membersOnly: boolean;
  tips: string[];
}

export const CATEGORY_ORDER = [
  "blur", "color", "distort", "procedural", "3d", "transform",
  "drawing", "matte", "opacity", "repeat", "text", "other",
];

export const CATEGORY_LABELS: Record<string, string> = {
  blur: "Blur",
  color: "Color",
  distort: "Distort",
  procedural: "Procedural",
  "3d": "3D",
  transform: "Transform",
  drawing: "Drawing",
  matte: "Matte",
  opacity: "Opacity",
  repeat: "Repeat",
  text: "Text",
  other: "Other",
};

export const AFFINITY_LABELS: Record<string, string> = {
  media: "media layers (video/image)",
  "text!": "text layers",
  "stroke!": "stroke/drawing layers",
  "freehand!": "freehand drawing layers",
  "animation!": "animation layers",
  "transform-animation!": "layers with transform animation",
};

/** Odd parameter ids that have no label in the app strings. */
const LABEL_OVERRIDES: Record<string, string> = {
  ccr: "Cyan/Red",
  "m g": "Magenta/Green",
  "y b": "Yellow/Blue",
  "y/b": "Yellow/Blue",
  "c/r": "Cyan/Red",
  "m/g": "Magenta/Green",
  mg: "Magenta/Green",
  shad_ccr: "Shadow Cyan/Red",
  "shad_m g": "Shadow Magenta/Green",
  "shad_y b": "Shadow Yellow/Blue",
  mid_ccr: "Midtone Cyan/Red",
  "mid_m g": "Midtone Magenta/Green",
  "mid_y b": "Midtone Yellow/Blue",
  high_ccr: "Highlight Cyan/Red",
  "high_m g": "Highlight Magenta/Green",
  "high_y b": "Highlight Yellow/Blue",
};

const TYPE_DESCRIPTIONS: Record<string, string> = {
  point: "A 2D on-screen position (X horizontal, Y vertical). Drag the handle to reposition.",
  xyz: "A 3D value with X, Y, and Z components.",
  orient: "A 3D orientation value (quaternion X, Y, Z, W).",
  "hue-disc": "A color wheel — drag to shift hue, with saturation and lightness rings.",
};

const SKIP_PARAM_TAGS = new Set(["texture", "preset", "tip"]);

export function typeLabel(param: Param): string {
  switch (param.type) {
    case "spinner":
      switch (param.unit) {
        case "percent": return "Percentage";
        case "angle": return "Angle (°)";
        case "hz": return "Frequency (Hz)";
        case "kelvin": return "Temperature (K)";
        case "rpm": return "Speed (RPM)";
        case "seconds": return "Duration (s)";
        case "relative-percent": return "Relative %";
        default: return "Number";
      }
    case "slider":
      if (param.unit === "percent") return "Percentage";
      if (param.unit === "integer") return "Integer";
      return "Slider";
    case "color": return "Color";
    case "selector": return "Dropdown";
    case "switch": return "Toggle";
    case "point": return "Point (X, Y)";
    case "xyz": return param.unit === "rotate" ? "XYZ Rotation" : "XYZ";
    case "orient": return "Orientation";
    case "hue-disc": return "Hue Disc";
    case "float": return "Number";
    default: return param.type;
  }
}

function formatValue(value: string | undefined, unit: string | undefined): string {
  if (value === undefined) return "—";
  const num = Number(value);
  switch (unit) {
    case "percent":
      return Number.isNaN(num) ? value : `${Math.round(num * 100)}%`;
    case "relative-percent":
      return Number.isNaN(num) ? value : `${num > 0 ? "+" : ""}${Math.round(num * 100)}%`;
    case "kelvin": return `${value} K`;
    case "hz": return `${value} Hz`;
    case "rpm": return `${value} RPM`;
    case "seconds": return `${value} s`;
    case "angle":
    case "angle-range": return `${value}°`;
    default: return value;
  }
}

export function formatDefault(param: Param): string {
  if (param.type === "switch") return param.default === "true" ? "On" : "Off";
  if (param.type === "selector" && param.choices?.length) {
    const choice = param.choices.find((c) => c.value === param.default);
    return choice?.label ?? param.default ?? "—";
  }
  return formatValue(param.default, param.unit);
}

/** Human-readable min/max range (and step) for a parameter, or "" if unbounded. */
export function formatRange(param: Param): string {
  if (param.min === undefined && param.max === undefined) return "";
  const lo = param.min !== undefined ? formatValue(param.min, param.unit) : "";
  const hi = param.max !== undefined ? formatValue(param.max, param.unit) : "";
  let range = lo && hi ? `${lo}–${hi}` : lo || hi;
  if (param.step && Number(param.step) !== 0) range += ` · ${param.step}`;
  return range;
}

function parseParams(paramsEntry: Entry | undefined, strings: Map<string, string>): Param[] {
  if (!paramsEntry) return [];
  const params: Param[] = [];
  for (const entry of entries(paramsEntry.children)) {
    if (entry.name === "section") {
      params.push({ type: "section", id: "", label: resolveStr(entry.attrs.text, strings) || "Options" });
      continue;
    }
    if (SKIP_PARAM_TAGS.has(entry.name)) continue;
    const id = entry.attrs.id;
    if (!id) continue;

    const override = LABEL_OVERRIDES[id.toLowerCase()];
    const param: Param = {
      type: entry.name,
      id,
      label: (override ?? resolveStr(entry.attrs.label, strings)) || id,
      default: entry.attrs.default ?? entry.attrs.deafult ?? entry.attrs.value,
      unit: entry.attrs.type,
      min: entry.attrs.min,
      max: entry.attrs.max,
      step: entry.attrs.step,
      ticks: entry.attrs.ticks,
      logscale: entry.attrs.logscale === "true",
      snap: entry.attrs.snap === "true",
      multiplier: entry.attrs.multiplier,
      bias: entry.attrs.bias === "true",
      alpha: entry.attrs.alpha,
    };
    if (entry.name === "selector") {
      param.choices = entries(entry.children)
        .filter((child) => child.name === "choice")
        .map((child) => ({ label: resolveStr(child.attrs.label, strings), value: child.attrs.value }));
    }
    params.push(param);
  }
  return params;
}

export function parseEffect(file: string, strings: Map<string, string>): Effect | null {
  const entry = findEntry(parseXml(read(join(EFFECTS_DIR, file))), "effect");
  if (!entry) return null;

  const attrs = entry.attrs;
  if (attrs.internal === "true" || attrs.deprecated === "true") return null;

  const rawName = attrs.name ?? "";
  const name = resolveStr(rawName, strings);
  const isRawUnresolved = rawName.startsWith("@string/") && !rawName.startsWith("@am:");
  if (!name || name === "@string/name" || isRawUnresolved) return null;

  const paramsEntry = findEntry(entry.children, "params");
  const params = parseParams(paramsEntry, strings);
  const tips = entries(paramsEntry?.children)
    .filter((child) => child.name === "tip")
    .map((child) => resolveStr(child.attrs.text, strings))
    .filter(Boolean);

  const tags = (attrs.tags ?? "").split(",").map((tag) => tag.trim()).filter(Boolean);
  const thumb = attrs.thumb ?? "";

  return {
    slug: basename(file, ".xml"),
    id: attrs.id ?? "",
    name,
    desc: resolveStr(attrs.desc, strings),
    category: attrs.category || "other",
    tags,
    thumb: null,
    thumbName: thumb ? basename(thumb).replace(/\.[a-z0-9]+$/i, "") : undefined,
    params,
    affinity: attrs.affinity || undefined,
    experimental: attrs.experimental === "true",
    membersOnly: tags.includes("membersOnly"),
    tips,
  };
}

export function parseEffects(strings: Map<string, string>): Effect[] {
  const files = readdirSync(EFFECTS_DIR).filter((file) => file.endsWith(".xml") && !file.startsWith("blend-"));
  const effects: Effect[] = [];
  for (const file of files) {
    const effect = parseEffect(file, strings);
    if (effect) effects.push(effect);
  }
  return effects;
}

/** Effects whose display name does not match any thumbnail file. */
const THUMB_OVERRIDES: Record<string, string> = {
  cartoon: "threshold.webp",
  "chromatic-vortexblur": "chromatic_zoom_blur.webp",
  gradientdisplace: "displacement_map.webp",
  "s3d-triprism2": "raster_extrude.webp",
  "volumetric-clouds": "clouds.webp",
  vortexblur: "spin_blur.webp",
  "vr-combined": "three_axis_cross.webp",
};

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

export function copyThumbnails(effects: Effect[]): { copied: number; missing: number } {
  ensureDir(THUMB_DEST);
  const index = new Map<string, string>();
  for (const file of readdirSync(THUMB_SRC)) {
    if (!file.endsWith(".webp") || file.endsWith("_bg.webp")) continue;
    const key = normalize(file.replace(/\.webp$/, ""));
    if (!index.has(key)) index.set(key, file);
  }

  let copied = 0;
  let missing = 0;
  for (const effect of effects) {
    const source =
      index.get(normalize(effect.name)) ??
      (effect.thumbName ? index.get(normalize(effect.thumbName)) : undefined) ??
      THUMB_OVERRIDES[effect.slug];
    if (source && existsSync(join(THUMB_SRC, source))) {
      const dest = `${effect.slug}.webp`;
      copyFileSync(join(THUMB_SRC, source), join(THUMB_DEST, dest));
      effect.thumb = dest;
      copied++;
    } else {
      missing++;
    }
  }
  return { copied, missing };
}

interface Block {
  section?: string;
  params: Param[];
}

function groupParams(params: Param[]): Block[] {
  const blocks: Block[] = [{ params: [] }];
  for (const param of params) {
    if (param.type === "section") blocks.push({ section: param.label, params: [] });
    else blocks[blocks.length - 1]!.params.push(param);
  }
  return blocks.filter((block) => block.params.length > 0);
}

function renderTable(params: Param[]): string[] {
  const lines = [
    "<table>",
    "<thead><tr><th>Parameter</th><th>Type</th><th>Default</th></tr></thead>",
    "<tbody>",
  ];
  for (const param of params) {
    const range = formatRange(param);
    const type = range ? `${typeLabel(param)}<br><small>${range}</small>` : typeLabel(param);
    lines.push(`<tr><td>${param.label}</td><td>${type}</td><td>${formatDefault(param)}</td></tr>`);
  }
  lines.push("</tbody>", "</table>", "");
  return lines;
}

export function groupByCategory(effects: Effect[]): Map<string, Effect[]> {
  const byCategory = new Map<string, Effect[]>();
  for (const effect of effects) {
    const list = byCategory.get(effect.category) ?? [];
    list.push(effect);
    byCategory.set(effect.category, list);
  }
  return byCategory;
}

export function buildEffectPage(effect: Effect): string {
  const lines: string[] = [];
  const categoryLabel = CATEGORY_LABELS[effect.category] ?? effect.category;

  lines.push("---");
  lines.push(`title: ${effect.name}`);
  lines.push(`description: "${effect.desc.replace(/"/g, '\\"')}"`);
  lines.push("---", "");
  lines.push(`# ${effect.name} <Badge type="info" text="${categoryLabel}" />`, "");

  if (effect.thumb) {
    lines.push("<div class=\"effect-thumb\">");
    lines.push(`  <img src="/effects/thumb/${effect.thumb}" alt="${effect.name} thumbnail" />`);
    lines.push("</div>", "");
  }
  if (effect.desc) lines.push(`> ${effect.desc}`, "");
  if (effect.membersOnly) lines.push("<Badge type=\"warning\" text=\"🔒 Members Only\" />", "");
  if (effect.experimental) {
    lines.push("::: warning Experimental");
    lines.push("This effect is experimental and may change between versions.");
    lines.push(":::", "");
  }
  for (const tip of effect.tips) lines.push("::: tip", tip, ":::", "");
  if (effect.affinity) {
    lines.push("::: info Layer Compatibility");
    lines.push(`This effect only works on **${AFFINITY_LABELS[effect.affinity] ?? effect.affinity}**.`);
    lines.push(":::", "");
  }

  if (effect.id) {
    lines.push("<details>", "<summary><strong>Project XML</strong></summary>", "");
    lines.push("```xml");
    lines.push(`<effect id="${effect.id}" locallyApplied="true"/>`);
    lines.push("```", "");
    lines.push("Omitted parameters use their defaults. See [Project & Preset Format](/authoring).", "");
    lines.push("</details>", "");
  }

  if (effect.params.length > 0) {
    lines.push("## Parameters", "", "<div class=\"effect-params\">", "");
    for (const block of groupParams(effect.params)) {
      if (block.section) {
        lines.push("<details>", `<summary><strong>${block.section}</strong></summary>`, "");
        lines.push(...renderTable(block.params));
        lines.push("</details>", "");
      } else {
        lines.push(...renderTable(block.params));
      }
    }
    lines.push("</div>", "");

    const explained = [...new Set(effect.params.map((param) => param.type))]
      .filter((type) => TYPE_DESCRIPTIONS[type])
      .sort();
    if (explained.length > 0) {
      lines.push("<p class=\"param-note\">");
      lines.push(explained.map((type) => `<code>${typeLabel({ type } as Param)}</code> — ${TYPE_DESCRIPTIONS[type]}`).join("<br>"));
      lines.push("</p>");
    }

    const selectors = effect.params.filter((param) => param.type === "selector" && param.choices?.length);
    if (selectors.length > 0) {
      lines.push("", "### Dropdown Options");
      for (const selector of selectors) {
        lines.push("", `**${selector.label}**`, "");
        for (const choice of selector.choices!) lines.push(`- ${choice.label}`);
      }
    }
  }

  lines.push("");
  return lines.join("\n");
}

function sorted(effects: Effect[]): Effect[] {
  return [...effects].sort((a, b) => a.name.localeCompare(b.name));
}

export function buildEffectsIndex(byCategory: Map<string, Effect[]>): string {
  const total = [...byCategory.values()].reduce((sum, list) => sum + list.length, 0);

  const lines: string[] = [];
  lines.push("---");
  lines.push("title: All Effects");
  lines.push(`description: Browse all ${total} Alight Motion effects by category.`);
  lines.push("---", "");
  lines.push("# All Effects", "");
  lines.push(`**${total} effects** across **${byCategory.size} categories**.`, "");
  lines.push("> Some effects only work on specific layer types — check each page for a compatibility note.", "");

  for (const category of CATEGORY_ORDER) {
    const list = byCategory.get(category);
    if (!list?.length) continue;
    lines.push(`## ${CATEGORY_LABELS[category] ?? category} (${list.length})`, "");
    for (const effect of sorted(list)) {
      lines.push(`- [${effect.name}](/effects/${category}/${effect.slug})${effect.membersOnly ? " 🔒" : ""}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

/** Sidebar items for the Effects group (one entry per category). */
export function buildEffectsSidebar(byCategory: Map<string, Effect[]>): string {
  const groups: string[] = [];
  for (const category of CATEGORY_ORDER) {
    const list = byCategory.get(category);
    if (!list?.length) continue;
    const items = sorted(list)
      .map((effect) => `              { text: '${effect.name.replace(/'/g, "\\'")}', link: '/effects/${category}/${effect.slug}' }`)
      .join(",\n");
    groups.push(`          {
            text: '${CATEGORY_LABELS[category] ?? category} (${list.length})',
            collapsed: true,
            items: [
${items}
            ]
          }`);
  }
  return `        {
          text: 'Effects',
          items: [
            { text: 'All Effects', link: '/effects/' },
${groups.join(",\n")}
          ]
        }`;
}
