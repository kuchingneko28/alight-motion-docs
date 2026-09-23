import { readdirSync, writeFileSync } from "fs";
import { join } from "path";
import { DOCS_DIR, EFFECTS_DIR, ensureDir } from "./apk";

export interface ElementType {
  id: string;
  name: string;
  description: string;
  properties: { name: string; desc: string }[];
  capabilities: string[];
  limitations?: string[];
}

export const ELEMENT_TYPES: ElementType[] = [
  {
    id: "shape",
    name: "Shape",
    description:
      "The most common layer type. Shapes can be rectangles, ellipses, polygons, stars, arcs, or any of the built-in shape templates. Every shape has a fill (solid color, gradient, or media) and an optional stroke.",
    properties: [
      { name: "Fill", desc: "Interior color/texture — None, Solid Color, Gradient (linear/radial/sweep), Media (image/video), or Intrinsic." },
      { name: "Stroke", desc: "Outline around the shape: width, color, position (inside/center/outside), cap, and join." },
      { name: "Transform", desc: "Position, scale, rotation, skew, and anchor point." },
      { name: "Blending", desc: "Opacity plus a blend mode for compositing with layers below." },
      { name: "Border & Shadow", desc: "Drop shadow and inner/outer borders." },
      { name: "Visual Effects", desc: "Any effect can be applied to a shape layer." },
    ],
    capabilities: ["Transform", "Opacity", "Fill", "Stroke", "Blending", "Border & Shadow", "Visual effects", "Renderable"],
  },
  {
    id: "drawing",
    name: "Drawing",
    description:
      "A freehand drawing or stroke layer created with the Drawing Tool. Supports variable-width strokes and taper. Uses a path-based stroke model rather than the fill + stroke model of shapes.",
    properties: [
      { name: "Stroke", desc: "The main visual: color, width, and taper (thinning at the start/end)." },
      { name: "Fill", desc: "Applies only to closed drawing paths." },
      { name: "Transform", desc: "Position, scale, rotation, and anchor point for the whole drawing." },
      { name: "Blending", desc: "Opacity and blend mode compositing." },
      { name: "Visual Effects", desc: "All effects apply; stroke effects (Stroke Color, Stroke Taper, Roughen Edges) are especially useful." },
    ],
    capabilities: ["Transform", "Opacity", "Fill", "Stroke", "Blending", "Border & Shadow", "Visual effects", "Renderable"],
  },
  {
    id: "text",
    name: "Text",
    description:
      "A text layer with full typographic control: fonts, bold/italic/underline, alignment, tracking, leading, and paragraph settings. Supports per-character Gain animation of color and opacity.",
    properties: [
      { name: "Text Content", desc: "The displayed string, font family, size, and bold/italic/underline styling." },
      { name: "Alignment", desc: "Horizontal and vertical alignment of the text block." },
      { name: "Tracking & Leading", desc: "Character spacing (tracking) and line spacing (leading)." },
      { name: "Fill", desc: "Color or gradient applied to the characters." },
      { name: "Stroke", desc: "Outline around each character." },
      { name: "Gain", desc: "Per-character animation of opacity and color, keyframable for reveal effects." },
      { name: "Visual Effects", desc: "All effects apply, plus text effects (Count Up/Down, Text Progress, Text Randomizer, Text Spacing, Text Transform, Timecode)." },
    ],
    capabilities: ["Transform", "Opacity", "Fill", "Stroke", "Blending", "Border & Shadow", "Gain", "Visual effects", "Renderable"],
  },
  {
    id: "camera",
    name: "Camera",
    description:
      "A movable viewpoint into the 3D scene with a configurable Field of View, either Perspective or Orthographic. It is not a renderable object itself.",
    properties: [
      { name: "Transform", desc: "Position and rotation in 3D space; Z controls zoom/distance." },
      { name: "Field of View (FOV)", desc: "Angular view width. Higher values give a wider, fish-eye view." },
      { name: "Camera Type", desc: "Perspective (realistic 3D) or Orthographic (no perspective distortion)." },
      { name: "Visual Effects", desc: "Some effects can be applied to affect the rendered view." },
    ],
    capabilities: ["Transform", "Field of view", "Perspective / orthographic", "Visual effects"],
    limitations: ["No fill or stroke", "No opacity or blend mode", "Not directly renderable"],
  },
  {
    id: "null-object",
    name: "Null Object",
    description:
      "An invisible layer used as a parenting reference. Parent other layers to a null object to move, scale, and rotate them as a group. Essential for rigging complex animations.",
    properties: [
      { name: "Transform", desc: "Position, scale, and rotation. Parented layers inherit and add to the null's transform." },
      { name: "Visual Effects", desc: "Effects on a null can affect the transform/rendering of its child layers." },
    ],
    capabilities: ["Transform", "Visual effects", "Parenting target"],
    limitations: ["Not renderable", "No fill, stroke, opacity, or blending"],
  },
  {
    id: "audio",
    name: "Audio",
    description: "An audio layer plays a sound file. It has volume and gain controls but no visual properties.",
    properties: [
      { name: "Source Media", desc: "The imported audio file (MP3, WAV, M4A, etc.)." },
      { name: "Volume", desc: "Overall loudness of the layer." },
      { name: "Gain", desc: "Per-keyframe volume animation for fades and ducking." },
    ],
    capabilities: ["Source media playback", "Volume", "Gain animation"],
    limitations: ["No visual properties", "No transform, blending, or effects"],
  },
  {
    id: "nested-scene",
    name: "Nested Scene",
    description:
      "Embeds an entire Alight Motion project (scene) inside the current project, enabling modular composition. Complex animations can be built as separate scenes and then composed together.",
    properties: [
      { name: "Transform", desc: "Position, scale, and rotation within the parent composition." },
      { name: "Opacity", desc: "Overall transparency of the nested scene." },
      { name: "Nested Scene", desc: "The embedded scene (.amp file) this layer references." },
      { name: "Visual Effects", desc: "Effects applied affect the whole nested content." },
    ],
    capabilities: ["Transform", "Opacity", "Nested scene reference", "Visual effects", "Renderable"],
    limitations: ["No fill or stroke", "No blending mode"],
  },
];

function buildElementsIndex(): string {
  const lines: string[] = [];
  lines.push("---");
  lines.push("title: Element Types");
  lines.push("description: Learn about every layer type in Alight Motion — Shape, Text, Camera, Null Object, Audio, Drawing, and Nested Scene.");
  lines.push("---", "");
  lines.push("# Element Types", "");
  lines.push(`Alight Motion has **${ELEMENT_TYPES.length} layer types**, each with its own capabilities and properties.`, "");
  lines.push("| Type | Description |", "|------|-------------|");
  for (const element of ELEMENT_TYPES) {
    lines.push(`| [${element.name}](#${element.id}) | ${element.description.split(".")[0]}. |`);
  }
  lines.push("", "---", "");

  for (const element of ELEMENT_TYPES) {
    lines.push(`## ${element.name} {#${element.id}}`, "", `> ${element.description}`, "");
    lines.push("### Properties", "", "| Property | Description |", "|----------|-------------|");
    for (const property of element.properties) {
      lines.push(`| **${property.name}** | ${property.desc} |`);
    }
    lines.push("", `**Capabilities:** ${element.capabilities.join(" · ")}`);
    if (element.limitations?.length) lines.push("", `**Limitations:** ${element.limitations.join(" · ")}`);
    lines.push("", "---", "");
  }
  return lines.join("\n");
}

export function generateElements(): void {
  ensureDir(join(DOCS_DIR, "elements"));
  writeFileSync(join(DOCS_DIR, "elements/index.md"), buildElementsIndex(), "utf-8");
}

const BLEND_CATEGORY: Record<string, string> = {
  normal: "Normal", multiply: "Normal",
  screen: "Lighten", lighten: "Lighten", "color-dodge": "Lighten", divide: "Lighten", "linear-dodge": "Lighten", "lighter-color": "Lighten",
  overlay: "Contrast", "hard-light": "Contrast", "soft-light": "Contrast", "linear-light": "Contrast", "vivid-light": "Contrast", "pin-light": "Contrast", "soft-overlay": "Contrast",
  darken: "Darken", "color-burn": "Darken", subtract: "Darken", "linear-burn": "Darken", "darker-color": "Darken",
  diff: "Difference", exclusion: "Difference", exclude: "Difference",
  hue: "Color", saturation: "Color", color: "Color", luminance: "Color", "color-multiply": "Color",
};

const BLEND_DESCRIPTIONS: Record<string, string> = {
  normal: "The default mode — the top layer covers the layer below with no color interaction.",
  multiply: "Multiplies the colors of both layers. Darkens the result — white has no effect.",
  screen: "Inverts, multiplies, and inverts again. Lightens the result — black has no effect.",
  overlay: "Combines Multiply and Screen. Dark areas get darker, light areas lighter.",
  darken: "Keeps the darker of the two color channels.",
  lighten: "Keeps the lighter of the two color channels.",
  "color-dodge": "Brightens the bottom layer by dividing by the inverse of the top. Black has no effect.",
  "color-burn": "Darkens the bottom layer by inverting, dividing, and inverting. White has no effect.",
  "hard-light": "Like Overlay with the roles swapped — the top layer controls the contrast effect.",
  "soft-light": "A softer version of Overlay.",
  diff: "Subtracts the darker from the lighter, channel by channel.",
  exclusion: "Like Difference but with lower contrast.",
  hue: "Takes the hue of the top layer with the saturation and luminance of the bottom.",
  saturation: "Takes the saturation of the top layer with the hue and luminance of the bottom.",
  color: "Takes the hue and saturation of the top layer with the luminance of the bottom.",
  luminance: "Takes the luminance of the top layer with the hue and saturation of the bottom.",
  divide: "Divides the bottom color by the top color. Black in the top layer makes white.",
  subtract: "Subtracts the top color from the bottom color. White in the top layer makes black.",
  "linear-dodge": "Adds the two colors together. Lightens — black has no effect.",
  "linear-burn": "Adds the inverses and inverts the result. Darkens — white has no effect.",
  "linear-light": "Combines Linear Dodge and Linear Burn based on the top layer.",
  "vivid-light": "Combines Color Dodge and Color Burn based on the top layer's luminance.",
  "pin-light": "Replaces colors based on whether the top is darker or lighter than 50%.",
  "soft-overlay": "A very subtle overlay effect.",
  "color-multiply": "Multiplies colors while preserving the luminance of the bottom layer.",
  "darker-color": "Keeps the darker pixel by overall brightness.",
  "lighter-color": "Keeps the lighter pixel by overall brightness.",
  exclude: "Like Exclusion with slightly different math.",
};

const BLEND_NAME_OVERRIDES: Record<string, string> = {
  "color-multiply": "Color Multiply",
};

const BLEND_ORDER = ["Normal", "Darken", "Lighten", "Contrast", "Difference", "Color"];

export interface BlendMode {
  slug: string;
  name: string;
  category: string;
  description: string;
}

export function getBlendModes(strings: Map<string, string>): BlendMode[] {
  const files = readdirSync(EFFECTS_DIR).filter((file) => file.startsWith("blend-") && file.endsWith(".xml"));
  return files.map((file) => {
    const slug = file.replace(/^blend-/, "").replace(/\.xml$/, "");
    const name = strings.get(`blend_${slug.replace(/-/g, "_")}`) ?? BLEND_NAME_OVERRIDES[slug] ?? slug;
    return { slug, name, category: BLEND_CATEGORY[slug] ?? "Other", description: BLEND_DESCRIPTIONS[slug] ?? `${name} blend mode.` };
  });
}

export function generateBlendModes(modes: BlendMode[]): number {

  const lines: string[] = [];
  lines.push("---");
  lines.push("title: Blend Modes");
  lines.push(`description: All ${modes.length} blend modes in Alight Motion, grouped by visual function.`);
  lines.push("---", "");
  lines.push("# Blend Modes", "");
  lines.push(`Alight Motion supports **${modes.length} blend modes**. They control how a layer's colors interact with the layers below it.`, "");

  for (const category of BLEND_ORDER) {
    const list = modes.filter((mode) => mode.category === category).sort((a, b) => a.name.localeCompare(b.name));
    if (list.length === 0) continue;
    lines.push(`## ${category}`, "");
    for (const mode of list) lines.push(`- **${mode.name}** — ${mode.description}`);
    lines.push("");
  }

  ensureDir(join(DOCS_DIR, "blend-modes"));
  writeFileSync(join(DOCS_DIR, "blend-modes/index.md"), lines.join("\n"), "utf-8");
  return modes.length;
}
