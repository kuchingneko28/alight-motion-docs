import { readFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
export const SCRIPTS_LIB = dirname(__filename);
export const SCRIPTS = dirname(SCRIPTS_LIB);
export const ROOT = join(SCRIPTS, "..");
export const DOCS_DIR = join(ROOT, "docs");
export const EFFECTS_DIR = join(ROOT, "decompiled_apk/assets/effects");
export const SHAPES_DIR = join(ROOT, "decompiled_apk/assets/shapes");
export const STRINGS_FILE = join(ROOT, "decompiled_apk/res/values/strings.xml");
export const APKTOOL_FILE = join(ROOT, "decompiled_apk/apktool.yml");
export const FEATURES_SRC = join(ROOT, "decompiled_apk/assets/features");
export const FEATURES_DEST = join(DOCS_DIR, "public/features");
export const CONFIG_FILE = join(DOCS_DIR, ".vitepress/config.ts");

export function readFile(path: string): string {
  return readFileSync(path, "utf-8");
}

export function ensureDir(path: string) {
  mkdirSync(path, { recursive: true });
}

export function getApkVersion(): string {
  const yaml = readFile(APKTOOL_FILE);
  const match = yaml.match(/versionName:\s*(\S+)/);
  return match ? match[1]! : "unknown";
}

export function parseStrings(xml: string): Map<string, string> {
  const map = new Map<string, string>();
  const pattern = /<string name="([^"]+)">([^<]*)<\/string>/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(xml)) !== null) {
    const key = match[1]!;
    const value = match[2]!
      .replace(/\\n/g, "\n")
      .replace(/\\'/g, "'")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"');
    map.set(key, value);
  }
  return map;
}

export function resolveStr(raw: string | undefined | null, strings: Map<string, string>): string {
  if (!raw) return "";
  const match = raw.match(/@(?:(?:am|android):)?string\/(.+)/);
  if (match) return strings.get(match[1]!) ?? "";
  return raw;
}

export function attr(tag: string, name: string): string {
  const pattern = new RegExp(`${name}="([^"]*)"`, "i");
  const match = tag.match(pattern);
  return match ? match[1]! : "";
}

export function stripShaders(xml: string): string {
  return xml
    .replace(/<shader[\s\S]*?<\/shader>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "");
}
