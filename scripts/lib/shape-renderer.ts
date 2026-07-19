import vm from "vm";
import { writeFileSync } from "fs";
import { join } from "path";
import { SHAPES_DIR, DOCS_DIR, readFile } from "./utils";

type Point = [number, number];

function getDefaultParams(xml: string): Record<string, any> {
  const params: Record<string, any> = {};
  const pattern = /<(point|spinner|slider|switch)\s+([^>]*?)\/?\s*>/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(xml)) !== null) {
    const tagName = match[1]!;
    const attrs = match[2]!;
    const id = attrs.match(/id="([^"]*)"/)?.[1];
    const defaultVal = attrs.match(/(?:default|value)="([^"]*)"/)?.[1];
    if (!id || defaultVal === undefined) continue;
    if (tagName === "point") {
      const parts = defaultVal.split(",").map(s => Number(s.trim()));
      params[id] = { x: parts[0], y: parts[1] };
    } else if (tagName === "switch") {
      params[id] = defaultVal === "true";
    } else {
      params[id] = Number(defaultVal);
    }
  }
  return params;
}

function extractJS(xml: string): string | null {
  const match = xml.match(/<script[^>]*>[\s\S]*?<!\[CDATA\[([\s\S]*?)\]\]>[\s\S]*?<\/script>/i);
  return match ? match[1]!.trim() : null;
}

function pathDataToSVGD(pathData: any[]): string {
  let d = "";
  let prevP: Point | null = null;
  let prevOut: Point | null = null;
  let firstP: Point | null = null;
  let firstIn: Point | null = null;

  for (const seg of pathData) {
    if (seg && seg.closed === true) {
      if (prevOut && firstIn && firstP && prevP) {
        d += ` C ${prevOut[0]} ${prevOut[1]}, ${firstIn[0]} ${firstIn[1]}, ${firstP[0]} ${firstP[1]}`;
      } else {
        d += " Z";
      }
      prevP = null; prevOut = null; firstP = null; firstIn = null;
      continue;
    }

    if (Array.isArray(seg) && seg.length >= 2) {
      const [x, y] = seg as Point;
      if (prevP === null) {
        d += `M ${x} ${y}`;
        firstP = [x, y];
      } else {
        d += ` L ${x} ${y}`;
      }
      prevP = [x, y];
      prevOut = null;
    } else if (seg && seg.p !== undefined) {
      const [x, y] = seg.p as Point;
      if (prevP === null) {
        d += `M ${x} ${y}`;
        firstP = [x, y];
        firstIn = seg.in || null;
      } else if (prevOut && seg.in) {
        d += ` C ${prevOut[0]} ${prevOut[1]}, ${seg.in[0]} ${seg.in[1]}, ${x} ${y}`;
      } else {
        d += ` L ${x} ${y}`;
      }
      prevP = [x, y];
      prevOut = seg.out || null;
    }
  }
  return d;
}

function computeBounds(pathData: any[]): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const visit = (x: number, y: number) => {
    minX = Math.min(minX, x); minY = Math.min(minY, y);
    maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
  };
  for (const seg of pathData) {
    if (!seg || seg.closed) continue;
    if (Array.isArray(seg)) { visit(seg[0], seg[1]); }
    else if (seg.p) {
      visit(seg.p[0], seg.p[1]);
      if (seg.in) visit(seg.in[0], seg.in[1]);
      if (seg.out) visit(seg.out[0], seg.out[1]);
    }
  }
  const pad = Math.max((maxX - minX) * 0.08, 10);
  return { minX: minX - pad, minY: minY - pad, maxX: maxX + pad, maxY: maxY + pad };
}

export function renderShapeSVG(xml: string): string | null {
  const jsCode = extractJS(xml);
  if (!jsCode) return null;

  const params = getDefaultParams(xml);

  const sandbox: any = {
    params,
    Math,
    result: null,
  };
  const context = vm.createContext(sandbox);
  const script = new vm.Script(`${jsCode}\nresult = getPath(params);`);
  script.runInContext(context);

  const pathData = sandbox.result;
  if (!Array.isArray(pathData) || pathData.length === 0) return null;

  const pathD = pathDataToSVGD(pathData);
  const b = computeBounds(pathData);
  const w = b.maxX - b.minX;
  const h = b.maxY - b.minY;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${b.minX} ${b.minY} ${w} ${h}" width="${w}" height="${h}">
  <rect x="${b.minX}" y="${b.minY}" width="${w}" height="${h}" fill="#f8f6fc"/>
  <path d="${pathD}" fill="rgba(109,40,217,0.08)" stroke="#6d28d9" stroke-width="2" stroke-linejoin="round"/>
</svg>`;
}

export function generateShapePreviews(): void {
  const destDir = join(DOCS_DIR, "public/shapes");
  const { mkdirSync, existsSync } = require("fs");
  if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });

  const { readdirSync } = require("fs");
  const files = readdirSync(SHAPES_DIR).filter((f: string) => f.endsWith(".xml"));

  for (const file of files) {
    const xml = readFile(join(SHAPES_DIR, file));
    const svg = renderShapeSVG(xml);
    if (svg) {
      const dest = join(destDir, file.replace(".xml", ".svg"));
      writeFileSync(dest, svg, "utf-8");
    }
  }
}
