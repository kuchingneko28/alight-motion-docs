import { readFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { XMLParser } from "fast-xml-parser";

const HERE = dirname(fileURLToPath(import.meta.url));

export const ROOT = join(HERE, "..", "..");
export const DOCS_DIR = join(ROOT, "docs");
export const EFFECTS_DIR = join(ROOT, "decompiled_apk/assets/effects");
export const SHAPES_DIR = join(ROOT, "decompiled_apk/assets/shapes");
export const STRINGS_FILE = join(ROOT, "decompiled_apk/res/values/strings.xml");
export const APKTOOL_FILE = join(ROOT, "decompiled_apk/apktool.yml");
export const CONFIG_FILE = join(DOCS_DIR, ".vitepress/config.ts");
export const THUMB_SRC = join(EFFECTS_DIR, "thumb");
export const THUMB_DEST = join(DOCS_DIR, "public/effects/thumb");

export function read(path: string): string {
  return readFileSync(path, "utf-8");
}

export function ensureDir(path: string): void {
  mkdirSync(path, { recursive: true });
}

export function getApkVersion(): string {
  const match = read(APKTOOL_FILE).match(/versionName:\s*(\S+)/);
  return match?.[1] ?? "unknown";
}

/** Parse res/values/strings.xml into a name -> value map. */
export function parseStrings(): Map<string, string> {
  const map = new Map<string, string>();
  const source = read(STRINGS_FILE);
  const pattern = /<string name="([^"]+)">([^<]*)<\/string>/g;
  for (let match = pattern.exec(source); match; match = pattern.exec(source)) {
    const [, key, value] = match;
    if (!key || value === undefined) continue;
    map.set(
      key,
      value
        .replace(/\\n/g, "\n")
        .replace(/\\'/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"'),
    );
  }
  return map;
}

/** Resolve an Android string reference like `@am:string/foo` or return the raw value. */
export function resolveStr(raw: string | undefined, strings: Map<string, string>): string {
  if (!raw) return "";
  const match = raw.match(/@(?:(?:am|android):)?string\/(.+)/);
  return match ? strings.get(match[1]!) ?? "" : raw;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  preserveOrder: true,
  cdataPropName: "__cdata",
  trimValues: true,
  parseTagValue: false,
  parseAttributeValue: false,
  allowBooleanAttributes: true,
});

export interface Entry {
  name: string;
  attrs: Record<string, string>;
  children: unknown[];
}

/** Parse an XML document into an ordered list of top-level entries. */
export function parseXml(source: string): unknown[] {
  return parser.parse(source) as unknown[];
}

/** Flatten preserveOrder nodes into ordered element entries (text/CDATA/markers removed). */
export function entries(nodes: unknown): Entry[] {
  if (!Array.isArray(nodes)) return [];
  const out: Entry[] = [];
  for (const node of nodes) {
    if (!node || typeof node !== "object") continue;
    const record = node as Record<string, unknown>;
    const attrs = (record[":@"] ?? {}) as Record<string, string>;
    for (const key of Object.keys(record)) {
      if (key.startsWith(":") || key.startsWith("#") || key === "__cdata") continue;
      const value = record[key];
      out.push({ name: key, attrs, children: Array.isArray(value) ? value : [] });
    }
  }
  return out;
}

export function findEntry(nodes: unknown, name: string): Entry | undefined {
  return entries(nodes).find((entry) => entry.name === name);
}
