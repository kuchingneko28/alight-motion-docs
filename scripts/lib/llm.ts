import { existsSync, readFileSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";
import { DOCS_DIR, ROOT, ensureDir } from "./apk";
import {
  AFFINITY_LABELS, CATEGORY_LABELS, CATEGORY_ORDER,
  type Effect, type Param, formatDefault, typeLabel,
} from "./effects";
import { SHAPE_DESCRIPTIONS, SHAPE_TYPE_LABELS, type Shape } from "./shapes";
import { ELEMENT_TYPES, type BlendMode } from "./reference";
import { buildCatalog } from "./catalog";

const LLM_DIR = join(DOCS_DIR, "public/llm");
const EXAMPLES_DIR = join(ROOT, "examples");

export interface LlmInput {
  apkVersion: string;
  effects: Effect[];
  shapes: Shape[];
  blendModes: BlendMode[];
}

const code = (value: string) => "`" + value + "`";
const fenced = (lang: string, body: string) => "```" + lang + "\n" + body + "\n```";

/** Convert a VitePress page into plain markdown (drop frontmatter, badges, anchors, site links, containers). */
function sanitize(page: string): string {
  let text = page.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
  text = text.replace(/<Badge[^>]*\btext="([^"]*)"[^>]*\/>/g, "$1");
  text = text.replace(/\s*\{#[^}]+\}/g, "");
  text = text.replace(/\[([^\]]+)\]\([#/][^)]*\)/g, "$1");

  const lines = text.split("\n");
  const out: string[] = [];
  let inContainer = false;
  for (const line of lines) {
    const fence = /^:::\s*([a-zA-Z-]+)?\s*(.*)$/.exec(line.trim());
    if (fence) {
      if (!inContainer) {
        inContainer = true;
        const title = fence[2]?.trim();
        if (title) out.push("", `**${title}**`, "");
      } else {
        inContainer = false;
        out.push("");
      }
      continue;
    }
    out.push(line);
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

function readPage(file: string): string {
  return sanitize(readFileSync(join(DOCS_DIR, file), "utf-8"));
}

function paramBlocks(params: Param[]): { section?: string; params: Param[] }[] {
  const blocks: { section?: string; params: Param[] }[] = [{ params: [] }];
  for (const param of params) {
    if (param.type === "section") blocks.push({ section: param.label, params: [] });
    else blocks[blocks.length - 1]!.params.push(param);
  }
  return blocks.filter((block) => block.params.length > 0);
}

function paramTable(params: Param[]): string {
  const lines = [
    "| Parameter | XML name | Type | Default |",
    "| --- | --- | --- | --- |",
  ];
  for (const param of params) {
    lines.push(`| ${param.label} | ${code(param.id)} | ${typeLabel(param)} | ${formatDefault(param)} |`);
  }
  return lines.join("\n");
}

function dropdowns(params: Param[]): string {
  const selectors = params.filter((param) => param.type === "selector" && param.choices?.length);
  if (selectors.length === 0) return "";
  const lines = ["", "**Dropdown options**", ""];
  for (const selector of selectors) {
    lines.push(`- **${selector.label}** — ${selector.choices!.map((choice) => choice.label).join(", ")}`);
  }
  return lines.join("\n");
}

function buildEffectSection(effect: Effect): string {
  const lines: string[] = [`## ${effect.name}`, ""];

  const meta = [code(effect.id), CATEGORY_LABELS[effect.category] ?? effect.category];
  if (effect.membersOnly) meta.push("🔒 Members only");
  if (effect.experimental) meta.push("Experimental");
  lines.push(meta.filter(Boolean).join(" · "), "");

  if (effect.desc) lines.push(effect.desc, "");
  if (effect.affinity) lines.push(`**Compatibility:** ${AFFINITY_LABELS[effect.affinity] ?? effect.affinity}`, "");
  if (effect.tags.length > 0) lines.push(`**Tags:** ${effect.tags.join(", ")}`, "");

  if (effect.id) {
    lines.push("**Canonical XML**", "");
    lines.push(fenced("xml", `<effect id="${effect.id}" locallyApplied="false"/>`));
    lines.push("");
  }

  if (effect.params.length > 0) {
    for (const block of paramBlocks(effect.params)) {
      if (block.section) lines.push(`### ${block.section}`, "");
      lines.push(paramTable(block.params), "");
    }
    const options = dropdowns(effect.params);
    if (options) lines.push(options, "");
  } else {
    lines.push("_No parameters._", "");
  }

  return lines.join("\n");
}

function buildEffectCategory(category: string, list: Effect[]): string {
  const label = CATEGORY_LABELS[category] ?? category;
  const sorted = [...list].sort((a, b) => a.name.localeCompare(b.name));
  const lines = [
    `# ${label} Effects`,
    "",
    `${sorted.length} effects.`,
    "",
    ...sorted.map((effect) => buildEffectSection(effect) + "\n---\n"),
  ];
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

function buildEffectsIndex(byCategory: Map<string, Effect[]>): string {
  const total = [...byCategory.values()].reduce((sum, list) => sum + list.length, 0);
  const lines = [
    "# Effect Reference",
    "",
    `${total} effects grouped into ${byCategory.size} categories. Each entry lists the canonical effect id,`,
    "its parameters with types and defaults, and any dropdown options. Apply an effect by referencing its id:",
    "",
    fenced("xml", `<effect id="com.alightcreative.effects.box" locallyApplied="false">\n  <property name="height" type="float" value="0.500000"/>\n</effect>`),
    "",
    "Omitted parameters use their defaults. A `com.alightcreative.effects.*` id that is not listed may",
    "still be valid — Alight Motion can download effects at runtime through the Effect Browser.",
    "",
    "Parameter tables list the in-app **Parameter** label and its **XML name**; always use the XML name",
    "in `<property name=\"…\">` tags.",
    "",
    "## Categories",
    "",
  ];
  for (const category of CATEGORY_ORDER) {
    const list = byCategory.get(category);
    if (!list?.length) continue;
    lines.push(`- **${CATEGORY_LABELS[category] ?? category}** (${list.length}) — ${code(`effects/${category}.md`)}`);
  }
  return lines.join("\n") + "\n";
}

function buildElementTypes(): string {
  const lines = [
    "# Element Types",
    "",
    `Alight Motion has ${ELEMENT_TYPES.length} layer types. Each type maps to an XML tag in a scene file.`,
    "",
    "| Type | XML tag | Description |",
    "| --- | --- | --- |",
  ];
  const tags: Record<string, string> = {
    shape: "shape", drawing: "drawing", text: "text", camera: "camera",
    "null-object": "nullobj", audio: "audio", "nested-scene": "embedScene",
  };
  for (const element of ELEMENT_TYPES) {
    lines.push(`| ${element.name} | ${code(tags[element.id] ?? element.id)} | ${element.description.split(".")[0]}. |`);
  }
  lines.push("");
  for (const element of ELEMENT_TYPES) {
    lines.push(`## ${element.name}`, "");
    lines.push(element.description, "");
    lines.push("**Properties**", "");
    lines.push("| Property | Description |", "| --- | --- |");
    for (const property of element.properties) lines.push(`| ${property.name} | ${property.desc} |`);
    lines.push("");
    lines.push(`**Capabilities:** ${element.capabilities.join(" · ")}`);
    if (element.limitations?.length) lines.push(`**Limitations:** ${element.limitations.join(" · ")}`);
    lines.push("");
  }
  return lines.join("\n");
}

function buildShapes(shapes: Shape[]): string {
  const lines = [
    "# Shape Templates",
    "",
    `Alight Motion includes ${shapes.length} built-in parametric shape templates. In a scene, a live shape`,
    "references its template with " + code('s=".<slug>"') + " inside a " + code("<shape>") + " element.",
    "",
    "| Shape | Project reference | Shape id |",
    "| --- | --- | --- |",
  ];
  for (const shape of shapes) {
    lines.push(`| ${shape.name} | ${code(`s=".${shape.slug}"`)} | ${code(shape.id)} |`);
  }
  lines.push("");
  for (const shape of shapes) {
    lines.push(`## ${shape.name}`, "");
    if (SHAPE_DESCRIPTIONS[shape.slug]) lines.push(SHAPE_DESCRIPTIONS[shape.slug], "");
    lines.push(`- **Project reference:** ${code(`s=".${shape.slug}"`)}`);
    lines.push(`- **Shape id:** ${code(shape.id)}`);
    lines.push("");
    if (shape.params.length > 0) {
      lines.push("| Parameter | XML name | Type | Default |", "| --- | --- | --- | --- |");
      for (const param of shape.params) {
        lines.push(`| ${param.label} | ${code(param.id)} | ${SHAPE_TYPE_LABELS[param.type] ?? param.type} | ${param.default ?? "—"} |`);
      }
      lines.push("");
    }
    lines.push(
      fenced("xml", `<shape id="1" label="${shape.name} 1" startTime="0" endTime="3000" fillType="color" s=".${shape.slug}">\n  <transform>…</transform>\n  <fillColor value="#FFE3914C"/>\n</shape>`),
      "",
    );
  }
  return lines.join("\n");
}

function buildBlendModes(modes: BlendMode[]): string {
  const order = ["Normal", "Darken", "Lighten", "Contrast", "Difference", "Color", "Other"];
  const lines = [
    "# Blend Modes",
    "",
    `Alight Motion supports ${modes.length} blend modes. A layer's blend mode is set with the`,
    code("blending") + " attribute on its element (omitted when " + code("normal") + ").",
    "",
  ];
  for (const category of order) {
    const list = modes.filter((mode) => mode.category === category).sort((a, b) => a.name.localeCompare(b.name));
    if (list.length === 0) continue;
    lines.push(`## ${category}`, "");
    for (const mode of list) lines.push(`- **${mode.name}** (${code(mode.slug)}) — ${mode.description}`);
    lines.push("");
  }
  return lines.join("\n");
}

function buildExamples(): string {
  const lines = [
    "# Example Scenes",
    "",
    "Complete scene files that are checked by the project's validator. Use them as starting",
    "points and as concrete examples of the project/preset format.",
    "",
  ];
  if (!existsSync(EXAMPLES_DIR)) {
    lines.push("_No example scenes are bundled._", "");
    return lines.join("\n");
  }
  const files = readdirSync(EXAMPLES_DIR).filter((file) => file.endsWith(".xml")).sort();
  for (const file of files) {
    const body = readFileSync(join(EXAMPLES_DIR, file), "utf-8").trim();
    lines.push(`## ${file}`, "", fenced("xml", body), "");
  }
  return lines.join("\n");
}

function buildOverview(input: LlmInput): string {
  return [
    "# Alight Motion — Overview",
    "",
    `This is an LLM knowledge bundle for Alight Motion (APK v${input.apkVersion}), a mobile motion-graphics and`,
    "video-editing app. It is generated from a reverse-engineered copy of the app and documents:",
    "",
    "- The **project/preset XML format** — how scenes, layers, effects, and keyframes are serialized.",
    "- The **effect catalog** — every effect with its canonical id and parameters.",
    "- **Element types**, **shape templates**, and **blend modes**.",
    "",
    "## What you can build",
    "",
    "An Alight Motion **project** and a **preset** are the same XML document. A preset just sets",
    code('type="preset"') + ". Because the format is XML, a model can generate a complete scene that adds",
    "layers, applies effects, and animates properties with keyframes.",
    "",
    "## Mental model",
    "",
    "1. A `<scene>` holds canvas settings (size, fps, duration, background) plus elements in z-order.",
    "2. Each element is a tag — `shape`, `text`, `drawing`, `camera`, `audio`, `nullobj`, or `embedScene`.",
    "3. Elements share a common set of attributes (`id`, `label`, `startTime`, `endTime`, `fillType`, …).",
    "4. Elements contain child tags in a fixed order: `transform`, `fillColor`, `gradient`, `effect`*, `gain`, …",
    "5. Effects reference a canonical id and carry `<property>` parameters.",
    "6. Any property can be static (`value=\"…\"`) or keyframed (`<kf>` children).",
    "",
    "## Files in this bundle",
    "",
    "- " + code("00-system-prompt.md") + " — a ready-to-paste system prompt for an Alight Motion assistant.",
    "- " + code("01-overview.md") + " — this file.",
    "- " + code("02-project-and-preset-format.md") + " — the complete scene XML format, defaults, ids, and naming.",
    "- " + code("03-editing-guide.md") + " — layers, common properties, and animation concepts.",
    "- " + code("04-element-types.md") + " — the seven layer types and their capabilities.",
    "- " + code("05-shape-templates.md") + " — the built-in shape templates and their parameters.",
    "- " + code("06-blend-modes.md") + " — blend modes by category.",
    "- " + code("07-effects/") + " — one file per effect category, plus an index.",
    "- " + code("08-examples.md") + " — complete, validator-checked example scenes.",
    "- " + code("catalog.json") + " — machine-readable list of effects, shapes, elements, and blend modes.",
    "",
  ].join("\n");
}

function buildSystemPrompt(input: LlmInput): string {
  return [
    "# System Prompt — Alight Motion Project Generator",
    "",
    "Paste the block below into your Claude project's custom instructions. The project knowledge should",
    "contain the rest of this bundle.",
    "",
    "---",
    "",
    "You are an expert Alight Motion project generator. Alight Motion projects and presets are plain XML",
    "scene documents. When the user asks for a scene, preset, or effect setup, reply with valid XML that",
    "Alight Motion can import.",
    "",
    "Rules:",
    "",
    "1. Always output a complete `<scene>` element with `title`, `width`, `height`, `exportWidth`,",
    "   `exportHeight`, `bgcolor`, `totalTime`, `fps`, `modifiedTime`, `amver`, `ffver`, `am`, and `amplatform`.",
    "2. Use `ffver=\"106\"` for a project, `ffver=\"107\"` for a preset (`type=\"preset\"`), and `ffver=\"108\"`",
    "   only when a layer has a speed map with more than one keyframe.",
    "3. Give every element a unique positive integer `id` (`1`, `2`, `3`, …). Reference parents with",
    "   `parent=\"<id>\"`.",
    "4. Name layers the way the app does: a base name plus the first unused number, e.g. `Rectangle 1`,",
    "   `Text 1`. Common base names: Rectangle, Circle, Star, Polygon, Rounded Rectangle, Text, Drawing,",
    "   Camera, Audio, Null, Group.",
    "5. Shapes use `s=\".<slug>\"` (for example `s=\".rect\"`, `s=\".circle\"`) and their parameters are",
    "   `<property>` tags. See the shape reference for parameters.",
    "6. Effects use the canonical id from the effect reference — this is never the XML file name. Effect",
    "   parameters use `<property name=\"…\">` where `…` is the parameter's **XML name** from the",
    "   reference, not its display label. Omit parameters that equal their defaults.",
    "7. Animate a property with `<kf t=\"…\" v=\"…\" e=\"…\"/>` children instead of a `value` attribute.",
    "   `t` is seconds; omit `e` for linear.",
    "8. Order child tags as: `transform`, `fillColor`, `gradient`, `effect`*, `gain`, then other content.",
    "9. Use `#AARRGGBB` for colors and `googlefonts?name=…&weight=…` for font descriptors.",
    "10. If an effect id is missing from the reference it may be a downloadable Effect Browser effect;",
    "    prefer ids from the reference. `08-examples.md` has complete scenes to copy from.",
    "",
    "When you are unsure of an effect id or parameter, look it up in the effect reference rather than",
    "guessing. Prefer a minimal, valid scene over an elaborate one that might fail to import.",
    "",
    "The documentation is unaffiliated with Alight Creative.",
    "",
  ].join("\n");
}

function buildReadme(input: LlmInput): string {
  return [
    "# Alight Motion — LLM Knowledge Bundle",
    "",
    `Plain-markdown reference for Alight Motion (APK v${input.apkVersion}) built for upload to an LLM`,
    "project (for example a Claude project). It is derived from the community docs at",
    "https://kuchingneko28.github.io/alight-motion-docs/ and is unaffiliated with Alight Creative.",
    "",
    `Contents: ${input.effects.length} effects, ${input.shapes.length} shape templates,`,
    `${ELEMENT_TYPES.length} element types, ${input.blendModes.length} blend modes, and the project/preset`,
    "XML format.",
    "",
    "## How to use",
    "",
    "1. Upload every `.md` file (and `catalog.json`) from this folder as project knowledge.",
    "2. Paste the contents of " + code("00-system-prompt.md") + " into the project's custom instructions.",
    "3. Ask for a project, preset, or effect setup; the assistant can then emit importable scene XML.",
    "",
    "## Files",
    "",
    "| File | Contents |",
    "| --- | --- |",
    "| " + code("00-system-prompt.md") + " | System prompt / instructions for the assistant. |",
    "| " + code("01-overview.md") + " | Orientation and mental model. |",
    "| " + code("02-project-and-preset-format.md") + " | Full scene XML format, defaults, ids, naming. |",
    "| " + code("03-editing-guide.md") + " | Layers, properties, effects, animation concepts. |",
    "| " + code("04-element-types.md") + " | The seven layer types. |",
    "| " + code("05-shape-templates.md") + " | Shape templates and parameters. |",
    "| " + code("06-blend-modes.md") + " | Blend modes. |",
    "| " + code("07-effects/") + " | Effects by category, with parameters and canonical ids. |",
    "| " + code("08-examples.md") + " | Complete example scenes. |",
    "| " + code("catalog.json") + " | Machine-readable catalog. |",
    "",
    "## Known limitations",
    "",
    "- The effect list covers only the effects bundled in this APK. Alight Motion can download",
    "  extra effects at runtime through the Effect Browser, so a valid `com.alightcreative.effects.*`",
    "  id may be missing here.",
    "- Only effect descriptions and parameters are included; preview images and blend-mode shaders",
    "  are not.",
    "- Some advanced schemas (for example imported-shape contours and nested scenes) are covered",
    "  briefly; see `02-project-and-preset-format.md`.",
    "- Generated from a reverse-engineered APK and unaffiliated with Alight Creative.",
    "",
  ].join("\n");
}

export function generateLlmDocs(input: LlmInput): number {
  ensureDir(LLM_DIR);
  ensureDir(join(LLM_DIR, "07-effects"));

  writeFileSync(join(LLM_DIR, "README.md"), buildReadme(input), "utf-8");
  writeFileSync(join(LLM_DIR, "00-system-prompt.md"), buildSystemPrompt(input), "utf-8");
  writeFileSync(join(LLM_DIR, "01-overview.md"), buildOverview(input), "utf-8");
  writeFileSync(join(LLM_DIR, "02-project-and-preset-format.md"), readPage("authoring.md"), "utf-8");
  writeFileSync(join(LLM_DIR, "03-editing-guide.md"), readPage("guide.md"), "utf-8");
  writeFileSync(join(LLM_DIR, "04-element-types.md"), buildElementTypes(), "utf-8");
  writeFileSync(join(LLM_DIR, "05-shape-templates.md"), buildShapes(input.shapes), "utf-8");
  writeFileSync(join(LLM_DIR, "06-blend-modes.md"), buildBlendModes(input.blendModes), "utf-8");

  const byCategory = new Map<string, Effect[]>();
  for (const effect of input.effects) {
    const list = byCategory.get(effect.category) ?? [];
    list.push(effect);
    byCategory.set(effect.category, list);
  }

  writeFileSync(join(LLM_DIR, "08-examples.md"), buildExamples(), "utf-8");

  let files = 9;
  writeFileSync(join(LLM_DIR, "07-effects/index.md"), buildEffectsIndex(byCategory), "utf-8");
  files++;
  for (const category of CATEGORY_ORDER) {
    const list = byCategory.get(category);
    if (!list?.length) continue;
    writeFileSync(join(LLM_DIR, "07-effects", `${category}.md`), buildEffectCategory(category, list), "utf-8");
    files++;
  }

  writeFileSync(join(LLM_DIR, "catalog.json"), buildCatalog(input), "utf-8");
  files++;

  return files;
}
