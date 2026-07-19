import { writeFileSync, existsSync, copyFileSync } from "fs";
import { join } from "path";
import { ROOT, DOCS_DIR, FEATURES_SRC, FEATURES_DEST, ensureDir } from "./utils";

export interface ElementType {
  id: string;
  name: string;
  xmlTag: string;
  description: string;
  capabilities: string[];
  limitations: string[];
  properties: { name: string; desc: string }[];
  image?: string;
}

export const ELEMENT_TYPES: ElementType[] = [
  {
    id: "shape",
    name: "Shape",
    xmlTag: "element",
    description:
      "The most common layer type. Shapes can be rectangles, ellipses, polygons, stars, arcs, or any of the 20 built-in shape templates. Every shape has a fill (solid color, gradient, or media) and optional stroke. Shapes are fully renderable and support all visual properties.",
    capabilities: [
      "Transform (position, scale, rotation, anchor point)",
      "Opacity control",
      "Fill — solid color, gradient, image, or video",
      "Stroke — width, color, position (inside/center/outside), cap, join",
      "Blending mode (28 modes)",
      "Border & shadow",
      "Visual effects stack",
      "On-canvas handles for direct manipulation",
      "Renderable — visible in preview and export",
    ],
    limitations: [],
    properties: [
      { name: "Fill", desc: "The interior color/texture of the shape. Can be None, Solid Color, Gradient (linear/radial/sweep), Media (image/video), or Intrinsic (determined by shape)." },
      { name: "Stroke", desc: "An outline around the shape. Configure width, color, position (inside the edge, centered, or outside), line cap (butt/round/square), and line join (miter/round/bevel)." },
      { name: "Transform", desc: "Move, scale, rotate, and skew the shape. Includes anchor point for rotation center." },
      { name: "Blending", desc: "Controls how the shape composits with layers below. Opacity slider + 28 blend modes." },
      { name: "Border & Shadow", desc: "Drop shadow and inner/outer border effects." },
      { name: "Visual Effects", desc: "Any effect can be applied to a shape layer (blur, color grade, distort, procedural generation, etc.)." },
    ],
  },
  {
    id: "drawing",
    name: "Drawing",
    xmlTag: "drawing",
    description:
      "A freehand drawing or stroke layer created with the Drawing Tool. Supports variable-width strokes, taper, and all visual properties. Unlike Shape layers, Drawing layers use a path-based stroke model rather than a fill+stroke model.",
    capabilities: [
      "Transform (position, scale, rotation, anchor point)",
      "Opacity control",
      "Fill (for closed drawing paths)",
      "Stroke — width, color, taper (start/end width)",
      "Blending mode",
      "Border & shadow",
      "Visual effects stack",
      "On-canvas path editing handles",
      "Renderable",
    ],
    limitations: [],
    properties: [
      { name: "Stroke", desc: "The main visual of a drawing. Configure color, width, and taper (thinning at the start/end of the stroke)." },
      { name: "Fill", desc: "Only applies to closed drawing paths." },
      { name: "Transform", desc: "Position, scale, rotation, and anchor point for the entire drawing." },
      { name: "Blending", desc: "Opacity and blend mode compositing." },
      { name: "Visual Effects", desc: "All effects are applicable (stroke-specific effects like Stroke Color, Stroke Taper, Roughen Edges are especially useful)." },
    ],
  },
  {
    id: "text",
    name: "Text",
    xmlTag: "text",
    description:
      "A text layer displays a string of text with full typographic control. Supports multiple fonts, text styling (bold/italic/underline), alignment, tracking, leading, and paragraph settings. Text layers can have a Gain effect for color/opacity animation.",
    capabilities: [
      "Transform (position, scale, rotation, anchor point)",
      "Opacity control",
      "Fill — solid color, gradient, image, or video",
      "Stroke — width, color, position, cap, join",
      "Blending mode",
      "Border & shadow",
      "Visual effects stack",
      "Text-specific properties (font, size, alignment, tracking, leading, etc.)",
      "Gain animation (per-character color & opacity)",
      "Renderable",
    ],
    limitations: [],
    properties: [
      { name: "Text Content", desc: "The string of text to display. Includes font family, font size, bold/italic/underline styling." },
      { name: "Text Alignment", desc: "Horizontal alignment (left/center/right) and vertical alignment." },
      { name: "Tracking & Leading", desc: "Character spacing (tracking) and line spacing (leading)." },
      { name: "Fill", desc: "Color or gradient applied to the text characters." },
      { name: "Stroke", desc: "Outline around each character, with configurable width and position." },
      { name: "Transform", desc: "Position, scale, rotation for the entire text block." },
      { name: "Gain", desc: "Per-character animation of opacity and color — keyframable for reveal effects." },
      { name: "Visual Effects", desc: "All effects apply, plus text-specific effects (Count Up/Down, Text Progress, Text Randomizer, Text Spacing, Text Transform, Timecode)." },
    ],
  },
  {
    id: "camera",
    name: "Camera",
    xmlTag: "camera",
    description:
      "A camera layer provides a movable viewpoint into the 3D scene. It has a Field of View (FOV) setting and can be either Perspective or Orthographic. Camera layers have transform and visual effects but no fill, stroke, opacity, or blending — they are not renderable objects themselves.",
    capabilities: [
      "Transform (position, scale, rotation, anchor point)",
      "Visual effects stack",
      "Field of View (FOV) adjustment",
      "Perspective / Orthographic camera type",
    ],
    limitations: [
      "No fill or stroke",
      "No opacity control (camera is always fully transparent)",
      "No blending mode",
      "No border or shadow",
      "Not directly renderable — affects how other layers are viewed",
    ],
    properties: [
      { name: "Transform", desc: "Position and rotation of the camera in 3D space. Z-position controls zoom/distance." },
      { name: "Field of View (FOV)", desc: "The camera's angular Field of View, controlling how much of the scene is visible. Higher values = wider view (fish-eye effect)." },
      { name: "Camera Type", desc: "Perspective (objects farther away appear smaller, realistic 3D) or Orthographic (no perspective distortion, objects stay same size regardless of distance)." },
      { name: "Visual Effects", desc: "Some effects can be applied to camera layers, affecting the rendered view." },
    ],
  },
  {
    id: "null-object",
    name: "Null Object",
    xmlTag: "nullobj",
    description:
      "A null object is an invisible layer used as a parenting reference. It has transform properties and can have visual effects, but is not rendered in the final output. Null objects are essential for rigging complex animations — you parent other layers to a null to control them as a group.",
    capabilities: [
      "Transform (position, scale, rotation, anchor point)",
      "Visual effects stack",
    ],
    limitations: [
      "No fill or stroke",
      "No opacity control",
      "No blending mode",
      "No border or shadow",
      "Not renderable — invisible in preview and export",
    ],
    properties: [
      { name: "Transform", desc: "Position, scale, and rotation. When other layers are parented to a null, they inherit and add to the null's transform." },
      { name: "Visual Effects", desc: "Effects on a null object affect the transform/rendering of its child layers." },
    ],
  },
  {
    id: "audio",
    name: "Audio",
    xmlTag: "audio",
    description:
      "An audio layer plays back a sound file. It has volume and gain controls but no visual properties — it cannot have fill, stroke, transform, blending, or visual effects. Audio layers are purely sonic.",
    capabilities: [
      "Source media playback",
      "Volume control",
      "Gain animation",
    ],
    limitations: [
      "No transform, fill, or stroke",
      "No visual content — not renderable",
      "No blending mode",
      "No border or shadow",
      "No visual effects",
    ],
    properties: [
      { name: "Source Media", desc: "The audio file (MP3, WAV, M4A, etc.) imported into the project." },
      { name: "Volume", desc: "Overall loudness of the audio layer." },
      { name: "Gain", desc: "Per-keyframe volume animation for fades and ducking." },
    ],
  },
  {
    id: "nested-scene",
    name: "Nested Scene",
    xmlTag: "nestedscene",
    description:
      "A nested scene layer embeds an entire Alight Motion project (scene) inside the current project. This allows for modular composition — complex animations can be built as separate scenes and then composed together. Nested scenes have transform, opacity, and visual effects.",
    capabilities: [
      "Transform (position, scale, rotation, anchor point)",
      "Opacity control",
      "Visual effects stack",
      "Nested scene reference",
    ],
    limitations: [
      "No fill or stroke",
      "No blending mode",
      "No border or shadow",
    ],
    properties: [
      { name: "Transform", desc: "Position, scale, and rotation of the nested scene within the parent composition." },
      { name: "Opacity", desc: "Overall transparency of the nested scene." },
      { name: "Nested Scene", desc: "The embedded scene file (.amp file) that this layer references." },
      { name: "Visual Effects", desc: "Effects applied to the nested scene affect its entire content." },
    ],
  },
];

const ELEMENTS_DOCS_DIR = join(DOCS_DIR, "elements");

const ELEMENT_ICONS: Record<string, string> = {
  shape: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#6d28d9" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/></svg>`,
  drawing: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#6d28d9" stroke-width="2"><path d="M3 17 Q7 5 12 12 Q16 18 21 6"/></svg>`,
  text: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#6d28d9" stroke-width="2"><text x="12" y="20" text-anchor="middle" font-size="20" fill="#6d28d9" stroke="none">A</text></svg>`,
  camera: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#6d28d9" stroke-width="2"><path d="M23 7a1 1 0 0 0-1-1h-3.5l-2-3h-7l-2 3H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h20a1 1 0 0 0 1-1z"/><circle cx="12" cy="13" r="4"/></svg>`,
  "null-object": `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#6d28d9" stroke-width="2" stroke-dasharray="2 2"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="12" y1="3" x2="12" y2="21"/></svg>`,
  audio: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#6d28d9" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M18.5 6.5a10 10 0 0 1 0 11M15.5 9.5a5 5 0 0 1 0 5"/></svg>`,
  "nested-scene": `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#6d28d9" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="3"/><rect x="6" y="6" width="12" height="12" rx="2" stroke-opacity="0.5"/></svg>`,
};

const CAPABILITY_FEATURES = [
  { key: "Transform", label: "Transform" },
  { key: "Opacity", label: "Opacity" },
  { key: "Fill", label: "Fill" },
  { key: "Stroke", label: "Stroke" },
  { key: "Blending", label: "Blending" },
  { key: "Border/Shadow", label: "Border & Shadow" },
  { key: "Visual Effects", label: "Visual Effects" },
  { key: "Renderable", label: "Renderable" },
  { key: "Gain", label: "Gain Animation" },
  { key: "Source Media", label: "Source Media" },
  { key: "Nested Scene", label: "Nested Scene" },
];

const ELEMENT_CAPABILITY_MAP: Record<string, Record<string, boolean>> = {
  shape: { Transform: true, Opacity: true, Fill: true, Stroke: true, Blending: true, "Border/Shadow": true, "Visual Effects": true, Renderable: true, Gain: false, "Source Media": false, "Nested Scene": false },
  drawing: { Transform: true, Opacity: true, Fill: true, Stroke: true, Blending: true, "Border/Shadow": true, "Visual Effects": true, Renderable: true, Gain: false, "Source Media": false, "Nested Scene": false },
  text: { Transform: true, Opacity: true, Fill: true, Stroke: true, Blending: true, "Border/Shadow": true, "Visual Effects": true, Renderable: true, Gain: true, "Source Media": false, "Nested Scene": false },
  camera: { Transform: true, Opacity: false, Fill: false, Stroke: false, Blending: false, "Border/Shadow": false, "Visual Effects": true, Renderable: false, Gain: false, "Source Media": false, "Nested Scene": false },
  "null-object": { Transform: true, Opacity: false, Fill: false, Stroke: false, Blending: false, "Border/Shadow": false, "Visual Effects": true, Renderable: false, Gain: false, "Source Media": false, "Nested Scene": false },
  audio: { Transform: false, Opacity: false, Fill: false, Stroke: false, Blending: false, "Border/Shadow": false, "Visual Effects": false, Renderable: false, Gain: true, "Source Media": true, "Nested Scene": false },
  "nested-scene": { Transform: true, Opacity: true, Fill: false, Stroke: false, Blending: false, "Border/Shadow": false, "Visual Effects": true, Renderable: true, Gain: false, "Source Media": false, "Nested Scene": true },
};

function buildCapabilityTable(): string[] {
  const lines: string[] = [];
  lines.push(`<table class="capability-matrix">`);
  lines.push(`<thead><tr><th>Feature</th>${ELEMENT_TYPES.map(e => `<th>${e.name}</th>`).join("")}</tr></thead>`);
  lines.push(`<tbody>`);
  for (const feat of CAPABILITY_FEATURES) {
    const cells = ELEMENT_TYPES.map(el => {
      const has = ELEMENT_CAPABILITY_MAP[el.id]?.[feat.key] ?? false;
      return `<td class="${has ? "cap-yes" : "cap-no"}">${has ? "✓" : "—"}</td>`;
    }).join("");
    lines.push(`<tr><td><strong>${feat.label}</strong></td>${cells}</tr>`);
  }
  lines.push(`</tbody>`);
  lines.push(`</table>`);
  return lines;
}

function buildElementSection(el: ElementType): string {
  let lines: string[] = [];
  const icon = ELEMENT_ICONS[el.id] || "";

  lines.push(`## <span class="element-icon">${icon}</span> ${el.name} {#${el.id}}`);
  lines.push(``);
  lines.push(`> ${el.description}`);
  lines.push(``);

  if (el.image) {
    lines.push(`<div class="element-image">`);
    lines.push(`  <img src="/features/${el.image}" alt="${el.name} layer illustration" />`);
    lines.push(`</div>`);
    lines.push(``);
  }

  lines.push(`### Properties`);
  lines.push(``);
  lines.push(`<table>`);
  lines.push(`<thead><tr><th>Property</th><th>Description</th></tr></thead>`);
  lines.push(`<tbody>`);
  for (const prop of el.properties) {
    lines.push(`<tr><td><strong>${prop.name}</strong></td><td>${prop.desc}</td></tr>`);
  }
  lines.push(`</tbody>`);
  lines.push(`</table>`);
  lines.push(``);

  if (el.capabilities.length > 0) {
    lines.push(`**Capabilities:**`);
    for (const cap of el.capabilities) {
      lines.push(`- ${cap}`);
    }
    lines.push(``);
  }

  if (el.limitations.length > 0) {
    lines.push(`**Limitations:**`);
    for (const lim of el.limitations) {
      lines.push(`- ${lim}`);
    }
    lines.push(``);
  }

  lines.push(`---`);
  lines.push(``);

  return lines.join("\n");
}

function buildElementsIndex(): string {
  let lines: string[] = [];

  lines.push(`---`);
  lines.push(`title: Element Types`);
  lines.push(`description: Learn about every layer type in Alight Motion — Shape, Text, Camera, Null Object, Audio, Drawing, and Nested Scene.`);
  lines.push(`---`);
  lines.push(``);
  lines.push(`# Element Types`);
  lines.push(``);
  lines.push(`Alight Motion has **${ELEMENT_TYPES.length} layer types**, each with its own set of capabilities and properties.`);
  lines.push(``);
  lines.push(`## Capability Matrix`);
  lines.push(``);
  lines.push(...buildCapabilityTable());
  lines.push(``);
  lines.push(`---`);
  lines.push(``);

  for (const el of ELEMENT_TYPES) {
    lines.push(buildElementSection(el));
  }

  return lines.join("\n");
}

export function getElementsSidebarGroup(): string {
  const items = ELEMENT_TYPES
    .map(el => `          { text: '${el.name}', link: '/elements/#${el.id}' }`)
    .join(",\n");

  return `      {
        text: 'Element Types',
        collapsed: true,
        items: [
          { text: 'All Elements', link: '/elements/' },
${items}
        ]
      }`;
}

export function copyElementImages(): void {
  ensureDir(FEATURES_DEST);
  for (const el of ELEMENT_TYPES) {
    if (el.image) {
      const src = join(FEATURES_SRC, el.image);
      if (existsSync(src)) {
        copyFileSync(src, join(FEATURES_DEST, el.image));
      }
    }
  }
}

export function generateElementPages(): void {
  console.log("\nConsolidating element types page...");
  ensureDir(ELEMENTS_DOCS_DIR);

  const indexPath = join(ELEMENTS_DOCS_DIR, "index.md");
  writeFileSync(indexPath, buildElementsIndex(), "utf-8");
  console.log(`  Wrote unified element types index to ${indexPath}`);
}
