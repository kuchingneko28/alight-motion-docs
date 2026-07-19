import { writeFileSync, readdirSync } from "fs";
import { join } from "path";
import {
  ROOT, DOCS_DIR, EFFECTS_DIR, STRINGS_FILE,
  readFile, ensureDir, parseStrings, resolveStr, attr,
} from "./utils";

interface BlendMode {
  slug: string;
  name: string;
  category: string;
  description: string;
  shaderGLSL?: string;
}

// Blend modes whose slugs don't directly map to string keys, or need fallback names
const BLEND_SLUG_OVERRIDES: Record<string, string> = {
  "color-burn": "blend_color_burn",
  "color-dodge": "blend_color_dodge",
  "color-multiply": "blend_color_multiply",
  "darker-color": "blend_darker_color",
  "hard-light": "blend_hard_light",
  "lighter-color": "blend_lighter_color",
  "linear-burn": "blend_linear_burn",
  "linear-dodge": "blend_linear_dodge",
  "linear-light": "blend_linear_light",
  "pin-light": "blend_pin_light",
  "soft-light": "blend_soft_light",
  "soft-overlay": "blend_soft_overlay",
  "vivid-light": "blend_vivid_light",
};

const BLEND_FALLBACK_NAMES: Record<string, string> = {
  "color-multiply": "Color Multiply",
};

const BLEND_CATEGORIES: Record<string, string> = {
  normal: "Normal",
  multiply: "Normal",
  screen: "Lighten",
  overlay: "Contrast",
  darken: "Darken",
  lighten: "Lighten",
  "color-dodge": "Lighten",
  "color-burn": "Darken",
  "hard-light": "Contrast",
  "soft-light": "Contrast",
  diff: "Difference",
  exclusion: "Difference",
  hue: "Color",
  saturation: "Color",
  color: "Color",
  luminance: "Color",
  divide: "Lighten",
  subtract: "Darken",
  "linear-dodge": "Lighten",
  "linear-burn": "Darken",
  "linear-light": "Contrast",
  "vivid-light": "Contrast",
  "pin-light": "Contrast",
  "soft-overlay": "Contrast",
  "color-multiply": "Color",
  "darker-color": "Darken",
  "lighter-color": "Lighten",
  exclude: "Difference",
};

const BLEND_DESCRIPTIONS: Record<string, string> = {
  normal: "The default mode. The top layer covers the layer below with no color interaction.",
  multiply: "Multiplies the colors of the top and bottom layers. Darkens the result — white has no effect, black makes black.",
  screen: "Inverts, multiplies, and inverts again. Lightens the result — black has no effect, white makes white.",
  overlay: "Combines Multiply and Screen. Dark areas get darker, light areas get lighter, midtones are preserved.",
  darken: "Keeps the darker of the two color channels (R, G, B independently).",
  lighten: "Keeps the lighter of the two color channels (R, G, B independently).",
  "color-dodge": "Brightens the bottom layer by dividing by the inverse of the top layer. White turns white, black has no effect.",
  "color-burn": "Darkens the bottom layer by inverting, dividing, and inverting. White has no effect, black makes black.",
  "hard-light": "Like Overlay but with the roles of top and bottom swapped. The top layer controls the contrast effect.",
  "soft-light": "A softer version of Overlay. Darkens or lightens the bottom layer based on the top layer's luminance.",
  diff: "Subtracts the darker from the lighter, channel by channel. Black produces no change, white inverts.",
  exclusion: "Similar to Difference but with lower contrast. Black produces no change, white inverts to ~50% gray.",
  hue: "Takes the hue of the top layer and the saturation + luminance of the bottom layer.",
  saturation: "Takes the saturation of the top layer and the hue + luminance of the bottom layer.",
  color: "Takes the hue + saturation of the top layer and the luminance of the bottom layer.",
  luminance: "Takes the luminance of the top layer and the hue + saturation of the bottom layer.",
  divide: "Divides the bottom color by the top color. Brightens the result. Black in the top layer makes white.",
  subtract: "Subtracts the top color from the bottom color. Darkens the result. White in the top layer makes black.",
  "linear-dodge": "Adds the top and bottom colors together. Lightens the result — black has no effect.",
  "linear-burn": "Adds the inverse of the top and bottom colors and inverts the result. Darkens — white has no effect.",
  "linear-light": "Combines Linear Dodge and Linear Burn. Burns or dodges based on the top layer.",
  "vivid-light": "Combines Color Dodge and Color Burn. Dodges or burns based on the top layer's luminance.",
  "pin-light": "Replaces colors based on the top layer. If the top is darker than 50%, dark pixels pass through.",
  "soft-overlay": "A very soft overlay effect — subtle contrast enhancement.",
  "color-multiply": "Multiplies colors while preserving luminance of the bottom layer.",
  "darker-color": "Compares the overall brightness of top and bottom — keeps the darker pixel entirely.",
  "lighter-color": "Compares the overall brightness of top and bottom — keeps the lighter pixel entirely.",
  exclude: "Like Exclusion but with slightly different math."
};

const BLEND_MODES_DOCS_DIR = join(DOCS_DIR, "blend-modes");

function parseBlendModeXML(file: string, strings: Map<string, string>): BlendMode | null {
  const slug = file.replace(/^blend-/, "").replace(".xml", "");
  const xml = readFile(join(EFFECTS_DIR, file));

  // Resolve proper display name from strings.xml
  const stringKey = BLEND_SLUG_OVERRIDES[slug] ?? `blend_${slug.replace(/-/g, "_")}`;
  const name = strings.get(stringKey) ?? BLEND_FALLBACK_NAMES[slug] ?? slug;

  // Extract shader
  const shaderMatch = xml.match(/<shader[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/shader>/i);
  const shaderGLSL = shaderMatch ? shaderMatch[1]!.trim() : undefined;

  const category = BLEND_CATEGORIES[slug] ?? "Other";
  const description = BLEND_DESCRIPTIONS[slug] ?? `${name} blending mode.`;

  return { slug, name, category, description, shaderGLSL };
}

function buildBlendModePage(mode: BlendMode): string {
  let lines: string[] = [];
  lines.push(`---`);
  lines.push(`title: ${mode.name}`);
  lines.push(`description: "${mode.name} blending mode — ${mode.category} category. ${mode.description.replace(/"/g, '\\"')}"`);
  lines.push(`---`);
  lines.push(``);
  lines.push(`# ${mode.name} <Badge type="info" text="${mode.category}" />`);
  lines.push(``);
  lines.push(`> ${mode.description}`);
  lines.push(``);

  if (mode.shaderGLSL) {
    lines.push(`## GLSL Shader`);
    lines.push(``);
    lines.push(`\`\`\`glsl`);
    lines.push(mode.shaderGLSL);
    lines.push(`\`\`\``);
    lines.push(``);
  }

  lines.push(`## See Also`);
  lines.push(``);
  lines.push(`- [Getting Started Guide](/guide#blend-modes) — learn how blend modes work`);
  lines.push(`- [All Blend Modes](/blend-modes/) — browse all ${24} blend modes`);

  return lines.join("\n");
}

const CATEGORY_ORDER = ["Normal", "Darken", "Lighten", "Contrast", "Difference", "Color", "Other"];

function buildBlendModesIndex(modes: BlendMode[]): string {
  const byCategory = new Map<string, BlendMode[]>();
  for (const mode of modes) {
    if (!byCategory.has(mode.category)) byCategory.set(mode.category, []);
    byCategory.get(mode.category)!.push(mode);
  }

  let lines: string[] = [];
  lines.push(`---`);
  lines.push(`title: Blend Modes`);
  lines.push(`description: All ${modes.length} blend modes in Alight Motion — with GLSL shader source code.`);
  lines.push(`---`);
  lines.push(``);
  lines.push(`# Blend Modes`);
  lines.push(``);
  lines.push(`Alight Motion supports **${modes.length} blend modes** grouped into categories.`);
  lines.push(``);
  lines.push(`> See the [Getting Started Guide](/guide#blend-modes) for a quick overview of blend modes and when to use each category.`);
  lines.push(``);

  for (const cat of CATEGORY_ORDER) {
    const list = byCategory.get(cat);
    if (!list) continue;
    lines.push(`## ${cat}`);
    lines.push(``);
    for (const mode of list) {
      lines.push(`- [${mode.name}](/blend-modes/${mode.slug}) — ${mode.description}`);
    }
    lines.push(``);
  }

  return lines.join("\n");
}

export function getBlendModesSidebarGroup(): string {
  const files = readdirSync(EFFECTS_DIR).filter(f => f.startsWith("blend-") && f.endsWith(".xml"));
  const stringsXml = readFile(STRINGS_FILE);
  const strings = parseStrings(stringsXml);

  const items = files
    .map(file => parseBlendModeXML(file, strings))
    .filter(Boolean)
    .sort((a, b) => a!.name.localeCompare(b!.name))
    .map(m => `          { text: '${m!.name}', link: '/blend-modes/${m!.slug}' }`)
    .join(",\n");

  return `      {
        text: 'Blend Modes',
        collapsed: true,
        items: [
${items}
        ]
      }`;
}

export function generateBlendModePages(): void {
  console.log("\nGenerating blend mode pages...");
  ensureDir(BLEND_MODES_DOCS_DIR);

  const stringsXml = readFile(STRINGS_FILE);
  const strings = parseStrings(stringsXml);
  const files = readdirSync(EFFECTS_DIR).filter(f => f.startsWith("blend-") && f.endsWith(".xml"));

  const modes: BlendMode[] = [];

  for (const file of files) {
    const mode = parseBlendModeXML(file, strings);
    if (!mode) {
      console.log(`  Skipped ${file}`);
      continue;
    }
    modes.push(mode);

    const pagePath = join(BLEND_MODES_DOCS_DIR, `${mode.slug}.md`);
    const content = buildBlendModePage(mode);
    writeFileSync(pagePath, content, "utf-8");
    console.log(`  Wrote ${pagePath}`);
  }

  const indexPath = join(BLEND_MODES_DOCS_DIR, "index.md");
  writeFileSync(indexPath, buildBlendModesIndex(modes), "utf-8");
  console.log(`  Wrote ${indexPath}`);
}
