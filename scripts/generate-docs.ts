import { readdirSync, writeFileSync, copyFileSync, existsSync } from "fs";
import { join, basename } from "path";
import {
  ROOT, DOCS_DIR, EFFECTS_DIR, STRINGS_FILE, APKTOOL_FILE, CONFIG_FILE, FEATURES_SRC, FEATURES_DEST,
  readFile, getApkVersion, ensureDir, parseStrings, resolveStr, attr, stripShaders,
} from "./lib/utils";
import { generateElementPages, getElementsSidebarGroup } from "./lib/element-types";
import { generateShapePages, getShapesSidebarGroup } from "./lib/shapes";
import { generateBlendModePages, getBlendModesSidebarGroup } from "./lib/blend-modes";
import { generateTransitionPages, getTransitionsSidebarGroup } from "./lib/transitions";

const THUMB_SRC = join(EFFECTS_DIR, "thumb");
const EFFECTS_DOCS_DIR = join(DOCS_DIR, "effects");
const THUMB_DEST = join(DOCS_DIR, "public/effects/thumb");

type ParamType = "spinner" | "slider" | "color" | "selector" | "switch" | "point" | "xyz" | "orient" | "hue-disc" | "float" | "texture" | "section" | "preset" | "unknown";

interface Choice {
  label: string;
  value: string;
}

interface Param {
  id: string;
  type: ParamType;
  label: string;
  default?: string;
  min?: string;
  max?: string;
  step?: string;
  unit?: string;
  snap?: string;      // snap point values from XML
  logscale?: string;  // logscale factor if set
  choices?: Choice[];
}

interface Effect {
  id: string;
  slug: string;
  name: string;
  desc: string;
  category: string;
  tags: string[];
  thumb: string | null;
  params: Param[];
  sourceFile: string;
  affinity?: string;      // layer type restriction (e.g. "media", "text!")
  experimental: boolean;  // experimental flag from XML
  membersOnly: boolean;   // requires paid subscription
  tips: string[];         // tip texts from <tip> elements
}

const CATEGORY_ORDER = ["blur", "color", "distort", "procedural", "3d", "transform", "drawing", "matte", "opacity", "repeat", "text", "other"];

const CATEGORY_LABELS: Record<string, string> = {
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

interface ValueCounts {
  values: Map<string, number>;
  total: number;
}

interface TypeInference {
  defaults: ValueCounts;
  mins: ValueCounts;
  maxs: ValueCounts;
}

const INFERRED_DEFAULTS: Record<string, { default?: string; min?: string; max?: string }> = {
  orient: { default: "0" },
  xyz: { default: "0, 0, 0" },
  float: { default: "0" },
};

const LABEL_OVERRIDES: Record<string, string> = {
  "ccr": "Cyan/Red",
  "m g": "Magenta/Green",
  "y b": "Yellow/Blue",
  "y/b": "Yellow/Blue",
  "c/r": "Cyan/Red",
  "m/g": "Magenta/Green",
  "mg": "Magenta/Green",
  "shad_ccr": "Shadow Cyan/Red",
  "shad_m g": "Shadow Magenta/Green",
  "shad_y b": "Shadow Yellow/Blue",
  "mid_ccr": "Midtone Cyan/Red",
  "mid_m g": "Midtone Magenta/Green",
  "mid_y b": "Midtone Yellow/Blue",
  "high_ccr": "Highlight Cyan/Red",
  "high_m g": "Highlight Magenta/Green",
  "high_y b": "Highlight Yellow/Blue",
};

function shouldSkipName(rawName: string, name: string): boolean {
  return !name || name === "@string/name" || (rawName.startsWith("@string/") && !rawName.startsWith("@am:"));
}

function parseParams(paramsXml: string, strings: Map<string, string>): Param[] {
  const params: Param[] = [];
  const tagPattern = /<([\w-]+)([^>]*?)(?:\/>|>(?:[\s\S]*?)<\/\1>)/gi;
  let tagMatch: RegExpExecArray | null;

  while ((tagMatch = tagPattern.exec(paramsXml)) !== null) {
    const fullTag = tagMatch[0];
    const tagName = tagMatch[1]!.toLowerCase() as ParamType;

    if (tagName === "texture" || tagName === "preset") continue;

    if (tagName === "section") {
      const sectionText = resolveStr(attr(fullTag, "text"), strings) || "";
      params.push({ id: "", type: "section", label: sectionText });
      continue;
    }

    // tip elements are handled at the effect level, skip here
    if (tagName === ("tip" as ParamType)) continue;

    const paramId = attr(fullTag, "id");
    if (!paramId) continue;

    const rawLabel = attr(fullTag, "label");
    const label = resolveStr(rawLabel, strings) || LABEL_OVERRIDES[paramId.toLowerCase()] || paramId;

    const param: Param = { id: paramId, type: tagName, label };

    const defaultVal = attr(fullTag, "default") || attr(fullTag, "value");
    if (defaultVal) param.default = defaultVal;
    const rawMin = attr(fullTag, "min");
    if (rawMin) param.min = rawMin;
    const rawMax = attr(fullTag, "max");
    if (rawMax) param.max = rawMax;
    const step = attr(fullTag, "step");
    if (step) param.step = step;
    const unit = attr(fullTag, "type");
    if (unit) param.unit = unit;
    const snap = attr(fullTag, "snap");
    if (snap) param.snap = snap;
    const logscale = attr(fullTag, "logscale");
    if (logscale) param.logscale = logscale;

    if (tagName === "selector") {
      const choicePattern = /<choice[^>]+label="([^"]*)"[^>]+value="([^"]*)"[^>]*\/?>/gi;
      const choices: Choice[] = [];
      let choiceMatch: RegExpExecArray | null;
      while ((choiceMatch = choicePattern.exec(fullTag)) !== null) {
        choices.push({ label: resolveStr(choiceMatch[1]!, strings), value: choiceMatch[2]! });
      }
      param.choices = choices;
    }

    params.push(param);
  }

  return params;
}

const AFFINITY_LABELS: Record<string, string> = {
  "media": "media layers (video/image)",
  "text!": "text layers",
  "stroke!": "stroke/drawing layers",
  "freehand!": "freehand drawing layers",
  "animation!": "animation layers",
  "transform-animation!": "layers with transform animation",
};

function parseEffect(xml: string, filename: string, strings: Map<string, string>): Effect | null {
  const stripped = stripShaders(xml);

  const effectTagMatch = stripped.match(/<effect([^>]+)>/i);
  if (!effectTagMatch) return null;
  const effectTag = effectTagMatch[1]!;

  const id = attr(effectTag, "id");
  const rawName = attr(effectTag, "name");
  const rawDesc = attr(effectTag, "desc");
  const category = attr(effectTag, "category") || "other";
  const rawTags = attr(effectTag, "tags");
  const rawThumb = attr(effectTag, "thumb");
  const isInternal = attr(effectTag, "internal") === "true";
  const isDeprecated = attr(effectTag, "deprecated") === "true";

  if (isInternal || isDeprecated) return null;

  const name = resolveStr(rawName, strings);
  const desc = resolveStr(rawDesc, strings);

  if (shouldSkipName(rawName, name)) return null;

  const tags = rawTags.split(",").map(tag => tag.trim()).filter(Boolean);

  const rawAffinity = attr(effectTag, "affinity");
  const affinity = rawAffinity || undefined;
  const experimental = attr(effectTag, "experimental") === "true";
  const membersOnly = tags.includes("membersOnly");

  // Extract <tip> elements
  const tipPattern = /<tip[^>]+text="([^"]*)"/gi;
  const tips: string[] = [];
  let tipMatch: RegExpExecArray | null;
  const paramsSection = stripped.match(/<params>([\s\S]*?)<\/params>/i);
  const paramsRaw = paramsSection ? paramsSection[0] : "";
  while ((tipMatch = tipPattern.exec(paramsRaw)) !== null) {
    const resolved = resolveStr(tipMatch[1]!, strings);
    if (resolved) tips.push(resolved.replace(/&amp;/g, "&"));
  }

  let thumb: string | null = null;
  if (rawThumb) {
    thumb = basename(rawThumb).replace(/\.(png|jpg|jpeg)$/i, ".webp");
  }

  // Parse params from <params> block, then append any params from <passes> block
  const params = paramsSection ? parseParams(paramsSection[1]!, strings) : [];
  const passesSection = stripped.match(/<passes>([\s\S]*?)<\/passes>/i);
  if (passesSection) {
    const passParams = parseParams(passesSection[1]!, strings);
    params.push(...passParams);
  }

  const slug = basename(filename, ".xml");

  return { id, slug, name, desc, category, tags, thumb, params, sourceFile: filename, affinity, experimental, membersOnly, tips };
}

function paramTypeLabel(param: Param): string {
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
        case "angle-range": return "Angle Range (°)";
        default: return "Number";
      }
    case "slider":
      return param.unit === "percent" ? "Percentage" : param.unit === "integer" ? "Integer" : "Slider";
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

function nameToThumbFile(name: string): string {
  return name
    .toLowerCase()
    .replace(/[\/\-&,]+/g, " ")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .trim() + ".webp";
}

const THUMB_ALIASES: Record<string, string> = {
  "boxblur": "box_blur.webp",
  "boxblur2": "box_blur.webp",
  "boxblur3": "box_blur.webp",
  "lensblur": "lens_blur.webp",
  "lensblur2": "lens_blur.webp",
  "spinblur": "spin_blur.webp",
  "spinblur2": "spin_blur.webp",
  "vortexblur": "spin_blur.webp",
  "zoomblur": "zoom_blur.webp",
  "zoomblur2": "zoom_blur.webp",
  "zoomblur3": "zoom_blur.webp",
  "dblur": "directional_blur.webp",
  "fastboxblur": "box_blur.webp",
  "chromatic-vortexblur": "chromatic_zoom_blur.webp",
  "warpblur": "warp_blur.webp",
  "cartoon": "threshold.webp",
  "coloradj": "color_tune.webp",
  "colorhot": "hot_color.webp",
  "colorhot2": "hot_color.webp",
  "colortune": "color_tune.webp",
  "colortune2": "color_tune.webp",
  "difference": "find_edges.webp",
  "rgb-gamma": "channel_remap_rgb.webp",
  "rgb-mixer": "channel_remap_rgb.webp",
  "layernormtest": "solid_color.webp",
  "irridescence": "iridescence.webp",
  "irridescence2": "iridescence.webp",
  "fractalwarp": "fractal_warp.webp",
  "fractalwarp2": "fractal_warp.webp",
  "fractalwarp3": "fractal_warp.webp",
  "fractalwarp4": "fractal_warp.webp",
  "turbulentdisplace": "turbulent_displace.webp",
  "turbulentdisplace2": "turbulent_displace.webp",
  "turbulentdisplace3": "turbulent_displace.webp",
  "perlindisplace": "turbulent_displace.webp",
  "randomdisplace": "random_displacement.webp",
  "displacemap": "displacement_map.webp",
  "displacemap2": "displacement_map.webp",
  "displacemap3": "displacement_map.webp",
  "displacemap-radial": "polar_displacement_map.webp",
  "gradientdisplace": "displacement_map.webp",
  "gradientoverlay": "gradient_overlay.webp",
  "gradientoverlay2": "gradient_overlay.webp",
  "circularripple": "circular_ripple.webp",
  "circularripple2": "circular_ripple.webp",
  "wavewarp": "wave_warp.webp",
  "wavewarp2": "wave_warp.webp",
  "swirl": "swirl.webp",
  "swirl2": "swirl.webp",
  "swirl3": "swirl.webp",
  "swirl4": "swirl.webp",
  "s3d-plus": "three_axis_cross.webp",
  "s3d-triprism": "raster_extrude.webp",
  "s3d-triprism2": "raster_extrude.webp",
  "flip": "flip_layer.webp",
  "flip2": "flip_layer.webp",
  "flip3": "flip_layer.webp",
  "noise": "noise.webp",
  "noise2": "noise.webp",
  "noise3": "noise.webp",
  "clouds": "clouds.webp",
  "clouds2": "clouds.webp",
  "clouds3": "clouds.webp",
  "simplestars": "simple_starfield.webp",
  "simplestars2": "simple_starfield.webp",
  "starfield": "starfield.webp",
  "starfield2": "starfield.webp",
  "starfield3": "starfield.webp",
  "glass": "glass.webp",
  "glass2": "glass.webp",
  "outline-bad": "smooth_edges.webp",
  "outline-basic": "smooth_edges.webp",
  "outline": "smooth_edges.webp",
  "internal-border": "smooth_bevel.webp",
  "internal-border-center": "smooth_bevel.webp",
  "internal-border-inside": "smooth_bevel.webp",
  "internal-border-outside": "smooth_bevel.webp",
  "internal-border-two": "smooth_bevel.webp",
  "internal-border-three": "smooth_bevel.webp",
  "internal-shadow": "long_shadow.webp",
  "dissolve": "dissolve.webp",
  "checkerdissolve": "block_dissolve.webp",
  "checkerdissolve2": "block_dissolve.webp",
  "blink": "blink.webp",
  "blink2": "blink.webp",
  "flicker": "flicker.webp",
  "flicker2": "flicker.webp",
  "mattechoke": "matte_choker.webp",
  "mattechoke2": "matte_choker.webp",
  "mattefringe": "matte_fringe.webp",
  "lumakey": "luma_key.webp",
  "lumakey2": "luma_key.webp",
  "lumakey3": "luma_key.webp",
  "chromakey": "chroma_key.webp",
  "chromakey-advanced": "advanced_chroma_key.webp",
  "fourcolorgradient": "four_color_gradient.webp",
  "facemotion": "auto_shake.webp",
  "counter": "count_up_down.webp",
  "fade": "fade_in_out.webp",
  "grow-parts": "move_along_path.webp",
  "morph-path": "move_along_path.webp",
  "pinchbulge": "pinch_bulge.webp",
  "pinchbulge2": "pinch_bulge.webp",
  "pinchbulgeinside": "inner_pinch_bulge.webp",
  "shake-parts": "move_along_path.webp",
  "shake": "auto_shake.webp",
  "shake2": "auto_shake.webp",
  "vr-combined": "three_axis_cross.webp",
  "volumetric-clouds": "clouds.webp",
};

function resolveThumbSrc(effect: Effect, thumbSrcDir: string): string | null {
  const candidates: string[] = [];

  const alias = THUMB_ALIASES[effect.slug];
  if (alias) {
    candidates.push(join(thumbSrcDir, alias));
  }

  if (effect.name && !effect.name.startsWith("@")) {
    candidates.push(join(thumbSrcDir, nameToThumbFile(effect.name)));
  }

  const slugClean = effect.slug.replace(/^s3d-/, "").replace(/-/g, "_");
  candidates.push(join(thumbSrcDir, slugClean + ".webp"));

  if (effect.thumb) {
    const fromXml = effect.thumb.replace(/\.(png|jpg|jpeg)$/i, ".webp");
    candidates.push(join(thumbSrcDir, fromXml));
    candidates.push(join(thumbSrcDir, effect.thumb));
  }

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

const PARAM_TYPE_DESCRIPTIONS: Record<string, string> = {
  spinner: "A dial/spinner control. Tap and drag to change the value.",
  slider: "A horizontal slider bar.",
  color: "A color picker — tap to choose a color and adjust opacity.",
  selector: "A dropdown or radio button — choose from a list of options.",
  switch: "An on/off toggle.",
  point: "A 2D on-screen position (X = horizontal, Y = vertical). Drag the handle to reposition.",
  xyz: "A 3D value with X, Y, and Z components.",
  "hue-disc": "A color wheel — drag to shift hue, adjust the inner ring for saturation, and outer ring for lightness.",
  orient: "A 3D orientation/rotation value, stored as a quaternion (X, Y, Z, W).",
  float: "A precise decimal number input.",
};

function fmtVal(value: string | undefined, unit: string | undefined): string {
  if (value === undefined) return '<span class="value-missing">\u2014</span>';
  if (unit === "percent") {
    const num = Number(value);
    return isNaN(num) ? value : `${Math.round(num * 100)}%`;
  }
  if (unit === "kelvin") return `${value} K`;
  if (unit === "hz") return `${value} Hz`;
  if (unit === "rpm") return `${value} RPM`;
  if (unit === "seconds") return `${value} s`;
  if (unit === "angle" || unit === "angle-range") return `${value}°`;
  if (unit === "relative-percent") {
    const num = Number(value);
    return isNaN(num) ? value : (num > 0 ? `+${Math.round(num * 100)}%` : `${Math.round(num * 100)}%`);
  }
  return value;
}

function cellVal(value: string | undefined): string {
  return value ?? '<span class="value-missing">\u2014</span>';
}

function fmtColorDefault(hex: string): string {
  // Parse ARGB hex #AARRGGBB or #RRGGBB
  const clean = hex.replace(/^#/, "");
  if (clean.length === 8) {
    const a = Math.round(parseInt(clean.slice(0, 2), 16) / 255 * 100);
    const r = parseInt(clean.slice(2, 4), 16);
    const g = parseInt(clean.slice(4, 6), 16);
    const b = parseInt(clean.slice(6, 8), 16);
    return `<span class="color-swatch" style="background:rgba(${r},${g},${b},${a/100})"></span> rgba(${r}, ${g}, ${b}, ${a}%)`;
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return `<span class="color-swatch" style="background:rgb(${r},${g},${b})"></span> rgb(${r}, ${g}, ${b})`;
  }
  return hex;
}

type Block =
  | { kind: "table"; params: Param[] }
  | { kind: "section"; label: string; params: Param[] };

function buildBlocks(params: Param[]): Block[] {
  const blocks: Block[] = [];
  let currentTable: Param[] = [];
  for (const param of params) {
    if (param.type === "section") {
      if (currentTable.length > 0) {
        blocks.push({ kind: "table", params: currentTable });
        currentTable = [];
      }
      blocks.push({ kind: "section", label: param.label, params: [] });
    } else {
      const last = blocks[blocks.length - 1];
      if (last && last.kind === "section") {
        last.params.push(param);
      } else {
        currentTable.push(param);
      }
    }
  }
  if (currentTable.length > 0) {
    blocks.push({ kind: "table", params: currentTable });
  }
  return blocks;
}

function paramDefaultLabel(param: Param): string {
  if (param.type === "switch") return param.default === "true" ? "On" : "Off";
  if (param.type === "selector" && param.choices && param.default !== undefined) {
    const match = param.choices.find(choice => choice.value === param.default);
    return match ? match.label : (param.default !== "" ? param.default : cellVal(undefined));
  }
  // Apply unit formatting to default value for all unit types
  return fmtVal(param.default, param.unit);
}

function paramRangeLabel(value: string | undefined, unit: string | undefined): string {
  return fmtVal(value, unit);
}

function paramRow(param: Param): string {
  const hasRange = param.type !== "switch" && !(param.type === "selector" && param.choices?.length);
  let defaultStr = paramDefaultLabel(param);
  // For color params with hex defaults, render a swatch
  if (param.type === "color" && param.default && param.default.startsWith("#")) {
    defaultStr = fmtColorDefault(param.default);
  }
  const minStr = hasRange ? paramRangeLabel(param.min, param.unit) : cellVal(undefined);
  const maxStr = hasRange ? paramRangeLabel(param.max, param.unit) : cellVal(undefined);
  // Show snap points instead of step when snap is more informative
  let snapOrStep: string;
  if (param.snap) {
    snapOrStep = `<span class="snap-values">${param.snap}</span>`;
  } else {
    snapOrStep = param.step ?? cellVal(undefined);
  }
  // Logscale note
  const logNote = param.logscale ? ` <span class="log-scale">(log)</span>` : "";
  const typeStr = paramTypeLabel(param) + logNote;
  return `<tr><td>${param.label}</td><td>${typeStr}</td><td>${defaultStr}</td><td>${minStr}</td><td>${maxStr}</td><td>${snapOrStep}</td></tr>`;
}

function renderTable(params: Param[], lines: string[]): void {
  if (params.length === 0) return;
  lines.push(`<table>`);
  lines.push(`<thead><tr><th>Parameter</th><th>Type</th><th>Default</th><th>Min</th><th>Max</th><th>Step / Snap</th></tr></thead>`);
  lines.push(`<tbody>`);
  for (const param of params) {
    lines.push(paramRow(param));
  }
  lines.push(`</tbody>`);
  lines.push(`</table>`);
  lines.push(``);
}

function buildEffectPage(effect: Effect): string {
  const { name, desc, category, tags, thumb, params, affinity, experimental, membersOnly, tips } = effect;

  const categoryLabel = CATEGORY_LABELS[category] ?? category;

  let lines: string[] = [];

  lines.push(`---`);
  lines.push(`title: ${name || effect.slug}`);
  lines.push(`description: "${(desc || "").replace(/"/g, '\\"')}"`);
  lines.push(`---`);
  lines.push(``);
  // Category badge inline with the h1 — native VitePress <Badge> component, zero custom CSS
  lines.push(`# ${name || effect.slug} <Badge type="info" text="${categoryLabel}" />`);
  lines.push(``);

  if (thumb) {
    lines.push(`<div class="effect-thumb">`);
    lines.push(`  <img src="/effects/thumb/${thumb}" alt="${name} thumbnail" />`);
    lines.push(`</div>`);
    lines.push(``);
  }

  if (desc) {
    lines.push(`> ${desc}`);
    lines.push(``);
  }

  // Members-only — native Badge below the description
  if (membersOnly) {
    lines.push(`<Badge type="warning" text="🔒 Members Only" />`);
    lines.push(``);
  }

  // Tip callouts (from <tip> elements in the XML)
  for (const tip of tips) {
    lines.push(`::: tip`);
    lines.push(tip);
    lines.push(`:::`);
    lines.push(``);
  }

  // Experimental warning
  if (experimental) {
    lines.push(`::: warning Experimental`);
    lines.push(`This is an experimental effect. It may behave differently across app versions or have known issues.`);
    lines.push(`:::`);
    lines.push(``);
  }

  // Affinity restriction
  if (affinity) {
    const affinityLabel = AFFINITY_LABELS[affinity] ?? affinity;
    lines.push(`::: info Layer Compatibility`);
    lines.push(`This effect only works on **${affinityLabel}**. It will not appear in the effects list for other layer types.`);
    lines.push(`:::`);
    lines.push(``);
  }



  const visibleParams = params.filter(param => param.type !== "texture" && param.type !== "preset");

  if (visibleParams.length > 0) {
    lines.push(`## Parameters`);
    lines.push(``);
    lines.push(`<div class="effect-params">`);
    lines.push(``);

    const blocks = buildBlocks(visibleParams);
    for (const block of blocks) {
      if (block.kind === "table") {
        renderTable(block.params, lines);
      } else {
        lines.push(`<details>`);
        lines.push(`<summary><strong>${block.label}</strong></summary>`);
        lines.push(``);
        renderTable(block.params, lines);
        lines.push(`</details>`);
        lines.push(``);
      }
    }

    lines.push(`</div>`);

    // Only show param type legend for non-obvious control types
    const needsExplanation = new Set(["point", "xyz", "orient", "hue-disc"]);
    const describedTypes = new Set(visibleParams.map(p => p.type));
    const descList = [...describedTypes]
      .filter(t => PARAM_TYPE_DESCRIPTIONS[t] && needsExplanation.has(t))
      .sort();

    if (descList.length > 0) {
      lines.push(`<p class="param-note">`);
      const typeDescs = descList.map(t => `<code>${paramTypeLabel({ type: t } as Param)}</code> — ${PARAM_TYPE_DESCRIPTIONS[t]}`).join("<br>");
      lines.push(typeDescs);
      lines.push(`</p>`);
    }

    const selectors = visibleParams.filter(param => param.type === "selector" && param.choices && param.choices.length > 0);
    if (selectors.length > 0) {
      lines.push(``);
      lines.push(`### Dropdown Options`);
      for (const selector of selectors) {
        lines.push(``);
        lines.push(`**${selector.label}**`);
        lines.push(``);
        for (const choice of selector.choices!) {
          lines.push(`- ${choice.label}`);
        }
      }
    }
  }

  lines.push(``);

  return lines.join("\n");
}

function buildSidebar(byCategory: Map<string, Effect[]>): string {
  const sidebarGroups: string[] = [];

  for (const category of CATEGORY_ORDER) {
    const effects = byCategory.get(category);
    if (!effects || effects.length === 0) continue;

    const label = CATEGORY_LABELS[category] ?? category;
    const items = effects
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(effect => `          { text: '${effect.name.replace(/'/g, "\\'")}', link: '/effects/${category}/${effect.slug}' }`)
      .join(",\n");

    sidebarGroups.push(`      {
        text: '${label}',
        collapsed: true,
        items: [
${items}
        ]
      }`);
  }

  return sidebarGroups.join(",\n");
}

function buildConfig(effectsSidebar: string, referenceSidebar: string): string {
  const base = process.env.VITEPRESS_BASE ?? "/";
  const basedFavicon = base === "/" ? "/favicon.ico" : `${base}favicon.ico`;
  return `import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '${base}',
  title: "Alight Motion Docs",
  description: "Community documentation for Alight Motion — effects, elements, shapes, blend modes, and more.",
  head: [
    ['link', { rel: 'icon', href: '${basedFavicon}' }],
    ['meta', { name: 'theme-color', content: '#1e66f5' }],
    ['style', {}, \`
:root {
  --vp-c-bg: #eff1f5;
  --vp-c-bg-alt: #e6e9ef;
  --vp-c-bg-elv: #ffffff;
  --vp-c-bg-soft: #e6e9ef;
  --vp-c-text-1: #4c4f69;
  --vp-c-text-2: #6c6f85;
  --vp-c-text-3: #9ca0b0;
  --vp-c-border: #ccd0da;
  --vp-c-divider: #ccd0da;
  --vp-c-gutter: #ccd0da;
  --vp-c-brand-1: #1e66f5;
  --vp-c-brand-2: #209fb5;
  --vp-c-brand-3: #1e66f5;
  --vp-c-brand-soft: rgba(30, 102, 245, 0.16);
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: linear-gradient(135deg, #1e66f5, #7287fd);
  --vp-home-hero-image-background-image: linear-gradient(135deg, #1e66f580, #7287fd80);
  --vp-home-hero-image-filter: blur(72px);
  --vp-button-brand-border: transparent;
  --vp-button-brand-text: #ffffff;
  --vp-button-brand-bg: #1e66f5;
  --vp-button-brand-hover-border: transparent;
  --vp-button-brand-hover-text: #ffffff;
  --vp-button-brand-hover-bg: #209fb5;
  --vp-button-alt-border: #1e66f540;
  --vp-button-alt-bg: transparent;
  --vp-button-alt-hover-border: #1e66f5;
  --vp-button-alt-hover-bg: #1e66f510;
  --vp-custom-block-info-border: #1e66f5;
  --vp-custom-block-info-text: #1e66f5;
  --vp-code-block-bg: #1e1e2e;
}
.dark {
  --vp-c-bg: #1e1e2e;
  --vp-c-bg-alt: #181825;
  --vp-c-bg-elv: #1e1e2e;
  --vp-c-bg-soft: #313244;
  --vp-c-text-1: #cdd6f4;
  --vp-c-text-2: #a6adc8;
  --vp-c-text-3: #6c7086;
  --vp-c-border: #313244;
  --vp-c-divider: #313244;
  --vp-c-gutter: #313244;
  --vp-c-brand-1: #89b4fa;
  --vp-c-brand-2: #74c7ec;
  --vp-c-brand-3: #89b4fa;
  --vp-c-brand-soft: rgba(137, 180, 250, 0.16);
  --vp-home-hero-name-background: linear-gradient(135deg, #89b4fa, #b4befe);
  --vp-home-hero-image-background-image: linear-gradient(135deg, #89b4fa80, #b4befe80);
  --vp-button-brand-bg: #89b4fa;
  --vp-button-brand-hover-bg: #74c7ec;
  --vp-button-alt-border: #89b4fa40;
  --vp-button-alt-hover-border: #89b4fa;
  --vp-button-alt-hover-bg: #89b4fa10;
  --vp-custom-block-info-border: #89b4fa;
  --vp-custom-block-info-text: #89b4fa;
  --vp-code-block-bg: #313244;
}
.vp-doc a { color: var(--vp-c-brand-1); }
.vp-doc a:hover { color: var(--vp-c-brand-2); }
\`],
  ],
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Guide', link: '/guide' },
      { text: 'Effects', link: '/effects/' },
      { text: 'Elements', link: '/elements/' },
      { text: 'Shapes', link: '/shapes/' },
      { text: 'Blend Modes', link: '/blend-modes/' },
      { text: 'Transitions', link: '/transitions/' },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/kuchingneko28/alight-motion-docs' },
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Guide', link: '/guide' },
        ]
      },
      {
        text: 'Effects',
        items: [
          { text: 'All Effects', link: '/effects/' },
        ]
      },
${effectsSidebar},
${referenceSidebar}
    ],

    search: {
      provider: 'local'
    },

    footer: {
      message: 'Community documentation — not affiliated with Alight Creative.',
    }
  }
})
`;
}


function buildEffectsIndex(byCategory: Map<string, Effect[]>): string {

  const total = [...byCategory.values()].reduce((sum, list) => sum + list.length, 0);

  let lines: string[] = [];
  lines.push(`---`);
  lines.push(`title: All Effects`);
  lines.push(`description: Browse all ${total} Alight Motion effects by category.`);
  lines.push(`---`);
  lines.push(``);
  lines.push(`# All Effects`);
  lines.push(``);
  lines.push(`**${total} effects** across **${byCategory.size} categories**.`);
  lines.push(``);
  lines.push(`> New to effects? See the [Getting Started Guide](/guide#working-with-effects) for how to add, adjust, and animate effects.`);
  lines.push(``);
  lines.push(`::: info Layer Compatibility`);
  lines.push(`Some effects only work on specific layer types ([learn more](/guide#layer-compatibility)). Check each page for compatibility warnings.`);
  lines.push(`:::`);
  lines.push(``);

  for (const category of CATEGORY_ORDER) {
    const effects = byCategory.get(category);
    if (!effects || effects.length === 0) continue;
    const label = CATEGORY_LABELS[category] ?? category;
    lines.push(`## ${label} (${effects.length})`);
    lines.push(``);
    const sorted = [...effects].sort((a, b) => a.name.localeCompare(b.name));
    for (const effect of sorted) {
      const lock = effect.membersOnly ? " 🔒" : "";
      lines.push(`- [${effect.name}](/effects/${category}/${effect.slug})${lock}`);
    }
    lines.push(``);
  }

  return lines.join("\n");
}


function buildHomepage(totalEffects: number, apkVersion: string, membersOnlyCount: number, categoryCount: number): string {
  return `---
layout: home
title: Alight Motion Docs
description: Community documentation for Alight Motion — effects, elements, shapes, blend modes, and more.

hero:
  name: "Alight Motion"
  text: "Complete Reference"
  tagline: "${totalEffects} effects · 7 element types · 20 shapes · 24 blend modes"
  image:
    src: /logo.svg
    alt: Alight Motion
  actions:
    - theme: brand
      text: Browse All Effects
      link: /effects/
    - theme: alt
      text: Getting Started Guide
      link: /guide

features:
  - icon:
      src: /shapes/star.svg
    title: Complete Effects Database
    details: ${totalEffects} effects across ${categoryCount} categories with full parameter tables, official thumbnails, and layer compatibility information — extracted from Alight Motion v${apkVersion}.
  - icon:
      src: /shapes/circle.svg
    title: Element Types & Shapes
    details: 7 layer types with detailed capability documentation and 20 built-in parametric shapes with rendered SVG previews and parameter tables.
  - icon:
      src: /shapes/quad.svg
    title: Blend Modes with Shaders
    details: All ${24} blend modes documented with their GLSL fragment shader source code, categorized by visual effect (Darken, Lighten, Contrast, Difference, Color).
  - icon:
      src: /shapes/poly.svg
    title: Membership Indicators
    details: ${membersOnlyCount} of ${totalEffects} effects require a paid Alight Motion subscription. Every members-only effect is clearly marked so you know before you try.
---
`;
}

function computeMode(counts: ValueCounts): string | undefined {
  if (counts.total < 5) return undefined;
  let bestValue: string | undefined;
  let bestCount = 0;
  for (const [value, count] of counts.values) {
    if (count > bestCount) {
      bestCount = count;
      bestValue = value;
    }
  }
  return bestCount >= counts.total * 0.5 ? bestValue : undefined;
}

function applyInferredDefaults(effects: Effect[], inference: Map<string, TypeInference>): void {
  for (const effect of effects) {
    for (const param of effect.params) {
      if (param.default !== undefined && param.min !== undefined && param.max !== undefined) continue;

      const hardcoded = INFERRED_DEFAULTS[param.type];
      const typeInfer = inference.get(param.type);

      if (param.default === undefined) {
        param.default = hardcoded?.default ?? (typeInfer ? computeMode(typeInfer.defaults) : undefined);
      }
      if (param.min === undefined) {
        param.min = hardcoded?.min ?? (typeInfer ? computeMode(typeInfer.mins) : undefined);
      }
      if (param.max === undefined) {
        param.max = hardcoded?.max ?? (typeInfer ? computeMode(typeInfer.maxs) : undefined);
      }
    }
  }
}

async function main() {
  const apkVersion = getApkVersion();
  console.log(`APK version: ${apkVersion}`);
  const stringsXml = readFile(STRINGS_FILE);
  const strings = parseStrings(stringsXml);
  console.log(`  Loaded ${strings.size} strings`);

  console.log("Cleaning previous output...");
  const { rmSync } = await import("fs");
  const docDirs = [EFFECTS_DOCS_DIR, THUMB_DEST, join(DOCS_DIR, "elements"), join(DOCS_DIR, "shapes"), join(DOCS_DIR, "blend-modes"), join(DOCS_DIR, "transitions"), join(DOCS_DIR, "public/features")];
  for (const dir of docDirs) {
    if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
  }

  console.log("Reading effect XML files...");
  const xmlFiles = readdirSync(EFFECTS_DIR).filter(file => file.endsWith(".xml"));
  console.log(`  Found ${xmlFiles.length} XML files`);

  const effects: Effect[] = [];
  let skipped = 0;

  for (const file of xmlFiles) {
    const xml = readFile(join(EFFECTS_DIR, file));
    const effect = parseEffect(xml, file, strings);
    if (!effect || !effect.name) {
      skipped++;
      continue;
    }
    effects.push(effect);
  }

  console.log(`  Parsed ${effects.length} effects (skipped ${skipped} internal/deprecated/unnamed)`);

  console.log("Inferring missing parameter values...");
  const inference = new Map<string, TypeInference>();
  for (const effect of effects) {
    for (const param of effect.params) {
      if (!inference.has(param.type)) {
        inference.set(param.type, {
          defaults: { values: new Map(), total: 0 },
          mins: { values: new Map(), total: 0 },
          maxs: { values: new Map(), total: 0 },
        });
      }
      const infer = inference.get(param.type)!;
      if (param.default !== undefined) {
        infer.defaults.values.set(param.default, (infer.defaults.values.get(param.default) ?? 0) + 1);
        infer.defaults.total++;
      }
      if (param.min !== undefined) {
        infer.mins.values.set(param.min, (infer.mins.values.get(param.min) ?? 0) + 1);
        infer.mins.total++;
      }
      if (param.max !== undefined) {
        infer.maxs.values.set(param.max, (infer.maxs.values.get(param.max) ?? 0) + 1);
        infer.maxs.total++;
      }
    }
  }
  applyInferredDefaults(effects, inference);

  const byCategory = new Map<string, Effect[]>();
  for (const effect of effects) {
    const category = effect.category;
    if (!byCategory.has(category)) byCategory.set(category, []);
    byCategory.get(category)!.push(effect);
  }

  console.log("\nCategory breakdown:");
  for (const [category, effectList] of [...byCategory.entries()].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${(CATEGORY_LABELS[category] ?? category).padEnd(15)} ${effectList.length}`);
  }

  console.log("\nCopying thumbnails...");
  ensureDir(THUMB_DEST);
  let copiedThumbs = 0;
  let missingThumbs = 0;

  for (const effect of effects) {
    const srcPath = resolveThumbSrc(effect, THUMB_SRC);
    if (srcPath) {
      const destName = nameToThumbFile(effect.name);
      effect.thumb = destName;
      try {
        copyFileSync(srcPath, join(THUMB_DEST, destName));
        copiedThumbs++;
      } catch {}
    } else {
      effect.thumb = null;
      missingThumbs++;
    }
  }
  console.log(`  Copied ${copiedThumbs} thumbnails (${missingThumbs} missing)`);

  console.log("\nGenerating effect pages...");
  let pageCount = 0;

  for (const [category, effectList] of byCategory.entries()) {
    const categoryDir = join(EFFECTS_DOCS_DIR, category);
    ensureDir(categoryDir);

    for (const effect of effectList) {
      const pagePath = join(categoryDir, `${effect.slug}.md`);
      const content = buildEffectPage(effect);
      writeFileSync(pagePath, content, "utf-8");
      pageCount++;
    }
  }

  console.log(`  Generated ${pageCount} pages`);

  const indexPath = join(EFFECTS_DOCS_DIR, "index.md");
  writeFileSync(indexPath, buildEffectsIndex(byCategory), "utf-8");

  console.log("\nGenerating VitePress config...");
  const effectsSidebar = buildSidebar(byCategory);
  const refElements = getElementsSidebarGroup();
  const refShapes = getShapesSidebarGroup();
  const refBlendModes = getBlendModesSidebarGroup();
  const refTransitions = getTransitionsSidebarGroup();
  const referenceSidebar = `      {
        text: 'Reference',
        items: [
${refElements},
${refShapes},
${refBlendModes},
${refTransitions}
        ]
      }`;
  const config = buildConfig(effectsSidebar, referenceSidebar);
  writeFileSync(CONFIG_FILE, config, "utf-8");

  const membersOnlyCount = effects.filter(e => e.membersOnly).length;
  const homeContent = buildHomepage(effects.length, apkVersion, membersOnlyCount, byCategory.size);

  writeFileSync(join(DOCS_DIR, "index.md"), homeContent, "utf-8");

  // === NEW SECTIONS ===
  generateElementPages();
  generateShapePages();
  generateBlendModePages();
  generateTransitionPages();

  console.log("\nCopying feature images...");
  if (existsSync(FEATURES_SRC)) {
    ensureDir(FEATURES_DEST);
    const featureFiles = readdirSync(FEATURES_SRC).filter(f => f.endsWith(".webp"));
    let copied = 0;
    for (const f of featureFiles) {
      copyFileSync(join(FEATURES_SRC, f), join(FEATURES_DEST, f));
      copied++;
    }
    console.log(`  Copied ${copied} feature images`);
  } else {
    console.log("  Feature images directory not found, skipping");
  }

  console.log(`\nDone! Run 'bun run docs:dev' to preview.\n`);
}

main().catch(console.error);
