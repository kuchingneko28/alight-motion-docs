import { writeFileSync, readdirSync } from "fs";
import { join } from "path";
import {
  ROOT, DOCS_DIR, SHAPES_DIR, STRINGS_FILE,
  readFile, ensureDir, parseStrings, resolveStr, attr, stripShaders,
} from "./utils";
import { generateShapePreviews } from "./shape-renderer";

interface ShapeParam {
  id: string;
  type: string;
  label: string;
  default?: string;
  min?: string;
  max?: string;
  step?: string;
}

interface ShapeData {
  id: string;
  name: string;
  slug: string;
  params: ShapeParam[];
  hasJS: boolean;
}

const SHAPES_DOCS_DIR = join(DOCS_DIR, "shapes");

function parseShape(xml: string, filename: string, strings: Map<string, string>): ShapeData | null {
  const match = xml.match(/<shape([^>]+)>/i);
  if (!match) return null;
  const tag = match[1]!;

  const id = attr(tag, "id");
  const rawName = attr(tag, "name");
  const name = resolveStr(rawName, strings) || filename.replace(".xml", "");

  const cleaned = stripShaders(xml);
  const paramsSection = cleaned.match(/<params>([\s\S]*?)<\/params>/i);
  const params: ShapeParam[] = [];

  if (paramsSection) {
    const paramPattern = /<([\w-]+)([^>]*?)(?:\/>|>(?:[\s\S]*?)<\/\1>)/gi;
    let pm: RegExpExecArray | null;
    while ((pm = paramPattern.exec(paramsSection[1]!)) !== null) {
      const fullTag = pm[0];
      const pType = pm[1]!.toLowerCase();
      const pId = attr(fullTag, "id");
      if (!pId) continue;
      const pLabel = resolveStr(attr(fullTag, "label"), strings) || pId;
      const param: ShapeParam = { id: pId, type: pType, label: pLabel };
      const d = attr(fullTag, "default") || attr(fullTag, "value");
      if (d) param.default = d;
      const min = attr(fullTag, "min");
      if (min) param.min = min;
      const max = attr(fullTag, "max");
      if (max) param.max = max;
      const step = attr(fullTag, "step");
      if (step) param.step = step;
      params.push(param);
    }
  }

  const hasJS = /<script[\s\S]*?<\/script>/i.test(xml);
  const slug = filename.replace(".xml", "");

  return { id, name, slug, params, hasJS };
}

function typeLabel(t: string): string {
  switch (t) {
    case "point": return "Point (X, Y)";
    case "spinner": return "Number";
    case "slider": return "Slider";
    case "switch": return "Toggle";
    default: return t;
  }
}

const SHAPE_RENDER_PREVIEW: Record<string, string> = {
  arc: "A curved line segment defined by start angle, end angle, and radius.",
  arrow: "A line with an arrowhead at one end.",
  calloutrr: "A rounded rectangle speech bubble / callout shape.",
  circle: "A perfect ellipse (oval or circle).",
  line: "A straight line segment between two points.",
  moon: "A crescent moon shape.",
  multifoil: "A multi-lobed flower / clover shape (trefoil, quatrefoil, etc.).",
  penta: "A pentagram / star polygon.",
  pie: "A pie/wedge shape (like a pizza slice).",
  plus: "A plus/cross shape.",
  poly: "A regular polygon with configurable side count.",
  quad: "A quadrilateral with four adjustable corners.",
  rect: "A rectangle with adjustable width and height.",
  roundrect: "A rounded rectangle with corner radius control.",
  stamp: "A multi-purpose stamp shape with configurable lobes and indentation.",
  star: "A star shape with configurable point count and inner/outer radius.",
  teardrop: "A teardrop / droplet shape.",
  testshape: "A simple test shape for debugging.",
  triangle: "An equilateral triangle.",
  wideline: "A wide rectangular line / bar.",
};

const HANDLE_COUNT: Record<string, number> = {
  arc: 3,
  arrow: 5,
  calloutrr: 6,
  circle: 8,
  line: 2,
  moon: 3,
  multifoil: 5,
  penta: 2,
  pie: 3,
  plus: 2,
  poly: 2,
  quad: 15,
  rect: 8,
  roundrect: 9,
  stamp: 5,
  star: 3,
  teardrop: 2,
  testshape: 1,
  triangle: 3,
  wideline: 4,
};

function buildShapeItemMarkdown(shape: ShapeData): string {
  const preview = SHAPE_RENDER_PREVIEW[shape.slug] || "";
  let lines: string[] = [];

  lines.push(`## ${shape.name}`);
  lines.push(``);
  if (preview) {
    lines.push(`> ${preview}`);
    lines.push(``);
  }

  lines.push(`<div class="shape-preview">`);
  lines.push(`  <img src="/shapes/${shape.slug}.svg" alt="${shape.name} preview" />`);
  lines.push(`</div>`);
  lines.push(``);

  if (shape.params.length > 0) {
    lines.push(`<table>`);
    lines.push(`<thead><tr><th>Parameter</th><th>Type</th><th>Default</th><th>Min</th><th>Max</th></tr></thead>`);
    lines.push(`<tbody>`);
    for (const param of shape.params) {
      const d = param.default ?? '<span class="value-missing">—</span>';
      const min = param.min ?? '<span class="value-missing">—</span>';
      const max = param.max ?? '<span class="value-missing">—</span>';
      lines.push(`<tr><td>${param.label}</td><td>${typeLabel(param.type)}</td><td>${d}</td><td>${min}</td><td>${max}</td></tr>`);
    }
    lines.push(`</tbody>`);
    lines.push(`</table>`);
    lines.push(``);
  }

  const handleCount = HANDLE_COUNT[shape.slug] ?? 0;
  lines.push(`**On-canvas handles:** ${handleCount}${shape.hasJS ? " · Custom JavaScript path generation" : ""}`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);

  return lines.join("\n");
}

function buildShapesIndex(shapes: ShapeData[]): string {
  let lines: string[] = [];
  lines.push(`---`);
  lines.push(`title: Shape Templates`);
  lines.push(`description: All ${shapes.length} built-in shape templates in Alight Motion — parameters, SVGs, and on-canvas handles.`);
  lines.push(`---`);
  lines.push(``);
  lines.push(`# Shape Templates`);
  lines.push(``);
  lines.push(`Alight Motion includes **${shapes.length} built-in shape templates**. Each shape is defined by an XML template with parameters and custom path generation.`);
  lines.push(``);
  lines.push(`> Learn how shapes work in the [Getting Started Guide](/guide#shape-templates). below is a gallery of all templates with their default appearance and parameters.`);
  lines.push(``);

  // Gallery quick-links
  lines.push(`## Gallery`);
  lines.push(``);
  for (const shape of shapes) {
    const preview = SHAPE_RENDER_PREVIEW[shape.slug] || "";
    lines.push(`- **[${shape.name}](#${shape.slug})** — ${preview}`);
  }
  lines.push(``);
  lines.push(`---`);
  lines.push(``);

  for (const shape of shapes) {
    lines.push(buildShapeItemMarkdown(shape));
  }

  return lines.join("\n");
}

export function getShapesSidebarGroup(): string {
  const files = readdirSync(SHAPES_DIR).filter(f => f.endsWith(".xml"));
  const stringsXml = readFile(STRINGS_FILE);
  const strings = parseStrings(stringsXml);

  const items = files
    .map(file => {
      const xml = readFile(join(SHAPES_DIR, file));
      return parseShape(xml, file, strings);
    })
    .filter(Boolean)
    .sort((a, b) => a!.name.localeCompare(b!.name))
    .map(s => `          { text: '${s!.name}', link: '/shapes/#${s!.slug}' }`)
    .join(",\n");

  return `      {
        text: 'Shape Templates',
        collapsed: true,
        items: [
          { text: 'All Shapes', link: '/shapes/' },
${items}
        ]
      }`;
}

export function generateShapePages(): void {
  console.log("\nGenerating shape gallery...");
  ensureDir(SHAPES_DOCS_DIR);

  console.log("  Generating SVG previews...");
  generateShapePreviews();

  const stringsXml = readFile(STRINGS_FILE);
  const strings = parseStrings(stringsXml);
  const files = readdirSync(SHAPES_DIR).filter(f => f.endsWith(".xml"));

  const shapes: ShapeData[] = [];

  for (const file of files) {
    const xml = readFile(join(SHAPES_DIR, file));
    const shape = parseShape(xml, file, strings);
    if (shape) shapes.push(shape);
  }

  shapes.sort((a, b) => a.name.localeCompare(b.name));

  const indexPath = join(SHAPES_DOCS_DIR, "index.md");
  writeFileSync(indexPath, buildShapesIndex(shapes), "utf-8");
  console.log(`  Wrote unified gallery index to ${indexPath}`);
}
