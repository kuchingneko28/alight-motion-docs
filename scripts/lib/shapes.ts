import vm from "vm";
import { readdirSync, writeFileSync } from "fs";
import { join } from "path";
import {
  DOCS_DIR, SHAPES_DIR,
  type Entry, entries, findEntry, parseXml, read, resolveStr, ensureDir,
} from "./apk";

export interface ShapeParam {
  id: string;
  type: string;
  label: string;
  default?: string;
  unit?: string;
}

export interface Shape {
  slug: string;
  id: string;
  name: string;
  params: ShapeParam[];
  hasScript: boolean;
  script?: string;
}

const SHAPES_DOCS_DIR = join(DOCS_DIR, "shapes");
const SHAPES_PUBLIC_DIR = join(DOCS_DIR, "public/shapes");

const SHAPE_DESCRIPTIONS: Record<string, string> = {
  arc: "A curved line segment defined by start angle, end angle, and radius.",
  arrow: "A line with an arrowhead at one end.",
  calloutrr: "A rounded rectangle speech bubble / callout shape.",
  circle: "A perfect ellipse (oval or circle).",
  line: "A straight line segment between two points.",
  moon: "A crescent moon shape.",
  multifoil: "A multi-lobed flower / clover shape.",
  penta: "A pentagram / star polygon.",
  pie: "A pie / wedge shape (like a pizza slice).",
  plus: "A plus / cross shape.",
  poly: "A regular polygon with a configurable side count.",
  quad: "A quadrilateral with four adjustable corners.",
  rect: "A rectangle with adjustable width and height.",
  roundrect: "A rounded rectangle with corner radius control.",
  stamp: "A multi-purpose stamp shape with configurable lobes and indentation.",
  star: "A star shape with configurable point count and inner/outer radius.",
  teardrop: "A teardrop / droplet shape.",
  testshape: "A simple test shape used for debugging.",
  triangle: "An equilateral triangle.",
  wideline: "A wide rectangular line / bar.",
};

const SHAPE_TYPE_LABELS: Record<string, string> = {
  point: "Point (X, Y)",
  spinner: "Number",
  slider: "Slider",
  switch: "Toggle",
};

function extractText(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(extractText).join("");
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if ("#text" in record) return extractText(record["#text"]);
    if ("__cdata" in record) return extractText(record["__cdata"]);
  }
  return "";
}

function cdata(entry: Entry): string {
  for (const node of entry.children) {
    if (node && typeof node === "object" && "__cdata" in node) {
      return extractText((node as Record<string, unknown>)["__cdata"]);
    }
  }
  return "";
}

export function parseShape(file: string, strings: Map<string, string>): Shape | null {
  const entry = findEntry(parseXml(read(join(SHAPES_DIR, file))), "shape");
  if (!entry) return null;

  const slug = file.replace(/\.xml$/, "");
  const name = resolveStr(entry.attrs.name, strings) || slug;

  const params: ShapeParam[] = [];
  const paramsEntry = findEntry(entry.children, "params");
  for (const paramEntry of entries(paramsEntry?.children)) {
    const id = paramEntry.attrs.id;
    if (!id) continue;
    params.push({
      id,
      type: paramEntry.name,
      label: resolveStr(paramEntry.attrs.label, strings) || id,
      default: paramEntry.attrs.default ?? paramEntry.attrs.value,
      unit: paramEntry.attrs.type,
    });
  }

  const scriptEntry = entries(entry.children).find((e) => e.name === "script");

  return { slug, id: entry.attrs.id ?? "", name, params, hasScript: !!scriptEntry, script: scriptEntry ? cdata(scriptEntry) : undefined };
}

function defaultParams(params: ShapeParam[]): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const param of params) {
    if (param.default === undefined) continue;
    if (param.type === "point") {
      const [x, y] = param.default.split(",").map((part) => Number(part.trim()));
      values[param.id] = { x, y };
    } else if (param.type === "switch") {
      values[param.id] = param.default === "true";
    } else {
      values[param.id] = Number(param.default);
    }
  }
  return values;
}

type Point = [number, number];

function pathDataToSVGD(pathData: unknown[]): string {
  let d = "";
  let prevPoint: Point | null = null;
  let prevOut: Point | null = null;
  let firstIn: Point | null = null;
  let firstPoint: Point | null = null;

  for (const segment of pathData) {
    if (segment && typeof segment === "object" && (segment as { closed?: boolean }).closed === true) {
      if (prevOut && firstIn && firstPoint) {
        d += ` C ${prevOut[0]} ${prevOut[1]}, ${firstIn[0]} ${firstIn[1]}, ${firstPoint[0]} ${firstPoint[1]}`;
      } else {
        d += " Z";
      }
      prevPoint = prevOut = firstIn = firstPoint = null;
      continue;
    }

    if (Array.isArray(segment) && segment.length >= 2) {
      const [x, y] = segment as Point;
      d += prevPoint === null ? `M ${x} ${y}` : ` L ${x} ${y}`;
      if (prevPoint === null) firstPoint = [x, y];
      prevPoint = [x, y];
      prevOut = null;
    } else if (segment && typeof segment === "object" && "p" in segment) {
      const node = segment as { p: Point; in?: Point; out?: Point };
      const [x, y] = node.p;
      if (prevPoint === null) {
        d += `M ${x} ${y}`;
        firstPoint = [x, y];
        firstIn = node.in ?? null;
      } else if (prevOut && node.in) {
        d += ` C ${prevOut[0]} ${prevOut[1]}, ${node.in[0]} ${node.in[1]}, ${x} ${y}`;
      } else {
        d += ` L ${x} ${y}`;
      }
      prevPoint = [x, y];
      prevOut = node.out ?? null;
    }
  }
  return d;
}

function boundsOf(pathData: unknown[]): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const visit = (x: number, y: number) => {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  };
  for (const segment of pathData) {
    if (!segment || (segment as { closed?: boolean }).closed) continue;
    if (Array.isArray(segment)) {
      visit(segment[0] as number, segment[1] as number);
    } else if ("p" in (segment as object)) {
      const node = segment as { p: Point; in?: Point; out?: Point };
      visit(node.p[0], node.p[1]);
      if (node.in) visit(node.in[0], node.in[1]);
      if (node.out) visit(node.out[0], node.out[1]);
    }
  }
  const pad = Math.max((maxX - minX) * 0.08, 10);
  return { minX: minX - pad, minY: minY - pad, maxX: maxX + pad, maxY: maxY + pad };
}

export function renderShapeSVG(shape: Shape): string | null {
  if (!shape.script) return null;

  const sandbox: { params: Record<string, unknown>; Math: Math; result: unknown } = {
    params: defaultParams(shape.params),
    Math,
    result: null,
  };
  const context = vm.createContext(sandbox);
  new vm.Script(`${shape.script}\nresult = getPath(params);`).runInContext(context);

  const pathData = sandbox.result;
  if (!Array.isArray(pathData) || pathData.length === 0) return null;

  const d = pathDataToSVGD(pathData);
  const b = boundsOf(pathData);
  const width = b.maxX - b.minX;
  const height = b.maxY - b.minY;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${b.minX} ${b.minY} ${width} ${height}" width="${width}" height="${height}">
  <rect x="${b.minX}" y="${b.minY}" width="${width}" height="${height}" fill="#f8f6fc"/>
  <path d="${d}" fill="rgba(109,40,217,0.08)" stroke="#6d28d9" stroke-width="2" stroke-linejoin="round"/>
</svg>`;
}

function renderShapeTable(params: ShapeParam[]): string[] {
  const lines = [
    "<table>",
    "<thead><tr><th>Parameter</th><th>Type</th><th>Default</th></tr></thead>",
    "<tbody>",
  ];
  for (const param of params) {
    lines.push(`<tr><td>${param.label}</td><td>${SHAPE_TYPE_LABELS[param.type] ?? param.type}</td><td>${param.default ?? "—"}</td></tr>`);
  }
  lines.push("</tbody>", "</table>", "");
  return lines;
}

export function buildShapesIndex(shapes: Shape[]): string {
  const lines: string[] = [];
  lines.push("---");
  lines.push("title: Shape Templates");
  lines.push(`description: All ${shapes.length} built-in shape templates in Alight Motion.`);
  lines.push("---", "");
  lines.push("# Shape Templates", "");
  lines.push(`Alight Motion includes **${shapes.length} built-in shape templates** — parametric shapes with adjustable parameters and on-canvas handles.`, "");
  lines.push("## Gallery", "");
  for (const shape of shapes) {
    lines.push(`- **[${shape.name}](#${shape.slug})** — ${SHAPE_DESCRIPTIONS[shape.slug] ?? ""}`);
  }
  lines.push("", "---", "");

  for (const shape of shapes) {
    lines.push(`## ${shape.name} {#${shape.slug}}`, "");
    if (SHAPE_DESCRIPTIONS[shape.slug]) lines.push(`> ${SHAPE_DESCRIPTIONS[shape.slug]}`, "");
    lines.push("<div class=\"shape-preview\">");
    lines.push(`  <img src="/shapes/${shape.slug}.svg" alt="${shape.name} preview" />`);
    lines.push("</div>", "");
    if (shape.params.length > 0) lines.push(...renderShapeTable(shape.params));
    lines.push(shape.hasScript ? "**Path generation:** custom JavaScript" : "**Path generation:** built-in", "");
    lines.push("---", "");
  }
  return lines.join("\n");
}

export function generateShapes(strings: Map<string, string>): number {
  ensureDir(SHAPES_DOCS_DIR);
  ensureDir(SHAPES_PUBLIC_DIR);

  const shapes = readdirSync(SHAPES_DIR)
    .filter((file) => file.endsWith(".xml"))
    .map((file) => parseShape(file, strings))
    .filter((shape): shape is Shape => shape !== null)
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const shape of shapes) {
    const svg = renderShapeSVG(shape);
    if (svg) writeFileSync(join(SHAPES_PUBLIC_DIR, `${shape.slug}.svg`), svg, "utf-8");
  }

  writeFileSync(join(SHAPES_DOCS_DIR, "index.md"), buildShapesIndex(shapes), "utf-8");
  return shapes.length;
}
