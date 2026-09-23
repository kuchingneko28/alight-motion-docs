#!/usr/bin/env bun
/**
 * Validate Alight Motion scene/project XML against the import format.
 *
 * Usage:
 *   bun run scripts/validate-scene.ts <file.xml> [more.xml ...]
 *   bun run scripts/validate-scene.ts            # validates *.xml in the repo root
 *   bun run scripts/validate-scene.ts --strict <file.xml>   # warnings become failures
 *
 * The checks are derived from the reverse-engineered format in docs/authoring.md:
 * scene attributes, element tags, id allocation, transform, effect/shape
 * references, property types and keyframes, and child ordering.
 */
import { readdirSync } from "fs";
import { join, basename } from "path";
import {
  ROOT, EFFECTS_DIR, SHAPES_DIR,
  type Entry, entries, findEntry, parseXml, read, parseStrings,
} from "./lib/apk";
import { parseEffects, type Effect } from "./lib/effects";
import { parseShape, type Shape } from "./lib/shapes";

const ELEMENT_TAGS = new Set(["shape", "text", "drawing", "embedScene", "audio", "camera", "nullobj"]);
const STANDARD_FPS = new Set([12, 15, 18, 20, 24, 25, 30, 48, 50, 60]);

const COLOR = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const SLUG = /^\.([a-z0-9]+)$/;

/** BlendingMode ids (BlendingMode.getId()); `blending` stores the short id. */
const BLEND_IDS = new Set([
  "normal", "multiply", "screen", "mask", "clipping-mask", "exclude",
  "diff", "exclusion", "lighten", "darken", "lighter-color", "darker-color",
  "color-burn", "linear-burn", "color-dodge", "linear-dodge", "overlay",
  "soft-light", "hard-light", "soft-overlay", "vivid-light", "linear-light",
  "pin-light", "hue", "saturation", "color", "luminance", "subtract", "divide",
]);

/** Effect/shape parameter type -> serialized property `type`. */
const WIRE_TYPE: Record<string, string> = {
  spinner: "float",
  slider: "float",
  float: "float",
  color: "color",
  selector: "int",
  switch: "bool",
  point: "vec2",
  xyz: "vec3",
  orient: "quat",
  "hue-disc": "vec3",
};

const SCENE_ATTR_ORDER = [
  "title", "width", "height", "exportWidth", "exportHeight", "precompose",
  "bgcolor", "totalTime", "fps", "modifiedTime", "amver", "ffver", "am",
  "amplatform", "templateLink", "type", "retime", "thumbnailTime",
  "retimeIn", "retimeOut", "retimeAdaptFPS", "namespace", "pretty", "isPackage",
];

const REQUIRED_SCENE_ATTRS = ["width", "height", "exportWidth", "exportHeight", "bgcolor", "totalTime", "fps", "ffver"];
const RECOMMENDED_SCENE_ATTRS = ["title", "modifiedTime", "amver", "am", "amplatform"];

const CHILD_RANK: Record<string, number> = {
  transform: 0, fillColor: 1, gradient: 2, effect: 3, gain: 4, speedMap: 5,
  border: 6, glow: 6, "path-stroke": 7, stroke: 7, shadow: 8,
  property: 9, parameter: 9, path: 9, content: 10,
};

const TRANSFORM_CHILDREN: Record<string, number> = {
  location: 3, pivot: 2, scale: 2, skew: 2, rotation: 1, opacity: 1,
};

interface Issue {
  level: "error" | "warn";
  msg: string;
}

class Report {
  issues: Issue[] = [];
  error(msg: string) { this.issues.push({ level: "error", msg }); }
  warn(msg: string) { this.issues.push({ level: "warn", msg }); }
  get errorCount() { return this.issues.filter((i) => i.level === "error").length; }
  get warnCount() { return this.issues.filter((i) => i.level === "warn").length; }
}

const isNum = (v: string | undefined): boolean => v !== undefined && v.trim() !== "" && Number.isFinite(Number(v));
const isInt = (v: string | undefined): boolean => isNum(v) && Number.isInteger(Number(v));
const isBool = (v: string | undefined): boolean => v === undefined || ["true", "false", "0", "1"].includes(v.trim().toLowerCase());
const isVec = (v: string | undefined, n: number): boolean => {
  if (v === undefined) return false;
  const parts = v.split(",").map((p) => p.trim());
  return parts.length === n && parts.every((p) => p !== "" && Number.isFinite(Number(p)));
};

function checkValue(type: string, value: string | undefined, report: Report, where: string): void {
  if (value === undefined) return;
  if (type === "color") {
    if (!COLOR.test(value)) report.error(`${where}: invalid color "${value}" (expected #AARRGGBB)`);
  } else if (type === "vec2") {
    if (!isVec(value, 2)) report.error(`${where}: expected "x,y", got "${value}"`);
  } else if (type === "vec3") {
    if (!isVec(value, 3)) report.error(`${where}: expected "x,y,z", got "${value}"`);
  } else if (type === "vec4" || type === "quat") {
    if (!isVec(value, 4)) report.error(`${where}: expected 4 numbers, got "${value}"`);
  } else if (type === "float" || type === "int") {
    if (!isNum(value)) report.error(`${where}: expected a number, got "${value}"`);
  } else if (type === "bool") {
    if (!isBool(value)) report.error(`${where}: expected true/false, got "${value}"`);
  }
}

/** Validate `<kf>` children. Returns true when the property is keyframed. */
function checkKeyframes(property: Entry, report: Report, where: string): boolean {
  const kfs = entries(property.children).filter((child) => child.name === "kf");
  if (kfs.length === 0) return false;
  kfs.forEach((kf, index) => {
    if (!isNum(kf.attrs.t)) report.error(`${where}: keyframe ${index + 1} has missing/invalid t`);
    if (kf.attrs.v === undefined && kf.attrs.value === undefined) {
      report.warn(`${where}: keyframe ${index + 1} has no v`);
    }
  });
  return true;
}

// ---------------------------------------------------------------------------
// Catalog: known effects, shapes and blend modes from the decompiled APK.
// ---------------------------------------------------------------------------

const strings = parseStrings();
const effects: Effect[] = parseEffects(strings);
const effectById = new Map(effects.map((e) => [e.id, e]));

/** Every effect id declared in an XML asset, including deprecated/internal ones. */
const allEffectIds = new Set<string>();
for (const file of readdirSync(EFFECTS_DIR)) {
  if (!file.endsWith(".xml")) continue;
  const match = read(join(EFFECTS_DIR, file)).match(/<effect\b[^>]*\bid="([^"]+)"/);
  if (match?.[1]) allEffectIds.add(match[1]);
}

const shapes: Shape[] = [];
for (const file of readdirSync(SHAPES_DIR)) {
  if (!file.endsWith(".xml")) continue;
  const shape = parseShape(file, strings);
  if (shape) shapes.push(shape);
}
const shapeBySlug = new Map(shapes.map((s) => [s.slug, s]));

// ---------------------------------------------------------------------------
// Element validation
// ---------------------------------------------------------------------------

function collectElements(entry: Entry, out: Entry[] = []): Entry[] {
  for (const child of entries(entry.children)) {
    if (ELEMENT_TAGS.has(child.name)) {
      out.push(child);
      collectElements(child, out);
    } else if (child.name === "scene") {
      collectElements(child, out);
    }
  }
  return out;
}

function validateProperties(propertyEntries: Entry[], known: Set<string>, report: Report, ctx: string): void {
  for (const prop of propertyEntries) {
    if (prop.name !== "property") {
      report.warn(`${ctx}: unexpected <${prop.name}> (expected <property>)`);
      continue;
    }
    const name = prop.attrs.name;
    const type = prop.attrs.type ?? "";
    if (!name) {
      report.error(`${ctx}: <property> missing name`);
      continue;
    }
    if (known.size > 0 && !known.has(name)) report.warn(`${ctx}: no parameter named "${name}"`);
    const keyed = checkKeyframes(prop, report, `${ctx}.${name}`);
    if (!keyed) checkValue(type, prop.attrs.value ?? prop.attrs.default, report, `${ctx}.${name}`);
  }
}

function validateTransform(transform: Entry, report: Report, ctx: string): void {
  for (const child of entries(transform.children)) {
    const arity = TRANSFORM_CHILDREN[child.name];
    if (arity === undefined) {
      report.warn(`${ctx}: unexpected <transform> child <${child.name}>`);
      continue;
    }
    if (entries(child.children).some((c) => c.name === "kf")) continue; // keyframed
    if (child.name === "location") {
      // Written as "x,y" or "x,y,z" depending on version.
      if (!isVec(child.attrs.value, 2) && !isVec(child.attrs.value, 3)) {
        report.error(`${ctx}.transform.location: expected "x,y" or "x,y,z", got "${child.attrs.value ?? ""}"`);
      }
      continue;
    }
    checkValue(arity === 3 ? "vec3" : arity === 2 ? "vec2" : "float", child.attrs.value, report, `${ctx}.transform.${child.name}`);
  }
}

function validateEffectStack(effectEntries: Entry[], report: Report, ctx: string): void {
  for (const effectEntry of effectEntries) {
    const id = effectEntry.attrs.id;
    if (!id) {
      report.error(`${ctx}: <effect> missing id`);
      continue;
    }
    const effect = effectById.get(id);
    if (!effect) {
      if (allEffectIds.has(id)) {
        report.warn(`${ctx}: effect "${id}" is deprecated/internal`);
      } else if (id.startsWith("com.alightcreative.")) {
        report.warn(`${ctx}: effect "${id}" is not in the bundled catalog (may be a downloadable Effect Browser effect)`);
      } else {
        report.error(`${ctx}: malformed effect id "${id}"`);
      }
    }
    if (effectEntry.attrs.locallyApplied === undefined) {
      report.warn(`${ctx}: effect "${id}" missing locallyApplied attribute`);
    }
    const known = new Set(effect?.params.filter((p) => p.id).map((p) => p.id) ?? []);
    for (const prop of entries(effectEntry.children)) {
      if (prop.name !== "property") {
        report.warn(`${ctx}: unexpected <${prop.name}> inside effect "${id}"`);
        continue;
      }
      const name = prop.attrs.name;
      const type = prop.attrs.type ?? "";
      if (name && effect) {
        const param = effect.params.find((p) => p.id === name && p.type !== "section");
        const expected = param ? WIRE_TYPE[param.type] : undefined;
        if (expected && type && expected !== type
          && !((expected === "float" && type === "int") || (expected === "int" && type === "float"))) {
          report.warn(`${ctx}: "${name}" type "${type}" (expected "${expected}")`);
        }
      }
      validateProperties([prop], known, report, `${ctx}>${id}`);
    }
  }
}

function validateElement(element: Entry, allIds: Set<number>, idCounts: Map<number, number>, report: Report): void {
  const kind = element.name;
  const label = element.attrs.label ?? "";
  const ctx = `<${kind}${label ? ` "${label}"` : ""}>`;

  if (!isInt(element.attrs.id)) {
    report.error(`${ctx}: missing or invalid id "${element.attrs.id ?? ""}"`);
  } else {
    const id = Number(element.attrs.id);
    if (id <= 0) report.error(`${ctx}: id must be positive, got ${id}`);
    if ((idCounts.get(id) ?? 0) > 1) report.error(`${ctx}: duplicate id ${id}`);
  }

  if (!label) report.warn(`${ctx}: missing label`);

  if (!isInt(element.attrs.startTime) || !isInt(element.attrs.endTime)) {
    report.error(`${ctx}: startTime/endTime must be integers`);
  } else if (Number(element.attrs.endTime) <= Number(element.attrs.startTime)) {
    report.error(`${ctx}: endTime (${element.attrs.endTime}) must be greater than startTime (${element.attrs.startTime})`);
  }

  const blending = element.attrs.blending;
  if (blending !== undefined && !BLEND_IDS.has(blending)) {
    report.error(`${ctx}: unknown blending mode "${blending}"`);
  }

  const fillType = element.attrs.fillType;
  if (fillType !== undefined && fillType !== fillType.toLowerCase()) {
    report.warn(`${ctx}: fillType should be lowercase (got "${fillType}")`);
  }

  // Child ordering + common children.
  let previousRank = -1;
  const effects: Entry[] = [];
  for (const child of entries(element.children)) {
    const rank = CHILD_RANK[child.name] ?? 99;
    if (rank < previousRank) {
      report.warn(`${ctx}: <${child.name}> appears out of order`);
    }
    previousRank = Math.max(previousRank, rank);

    if (child.name === "transform") validateTransform(child, report, ctx);
    else if (child.name === "fillColor") checkValue("color", child.attrs.value, report, `${ctx}.fillColor`);
    else if (child.name === "effect") effects.push(child);
    else if (child.name === "speedMap") {
      const kfs = entries(child.children).filter((c) => c.name === "kf").length;
      if (kfs < 2) report.warn(`${ctx}: <speedMap> should have at least 2 keyframes`);
    }
  }

  validateEffectStack(effects, report, ctx);

  // Type-specific checks.
  if (kind === "shape") {
    const ref = element.attrs.s;
    if (ref === undefined) {
      report.warn(`${ctx}: no s=".shape" reference (custom/imported shape?)`);
    } else {
      const match = ref.match(SLUG);
      const shape = match ? shapeBySlug.get(match[1]!) : undefined;
      if (!match) report.error(`${ctx}: invalid shape reference "${ref}" (expected ".slug")`);
      else if (!shape) report.error(`${ctx}: unknown shape template "${ref}"`);
    }
    const known = new Set(shapeBySlug.get(element.attrs.s?.slice(1) ?? "")?.params.map((p) => p.id) ?? []);
    validateProperties(entries(element.children).filter((c) => c.name === "property"), known, report, ctx);
  }

  if (kind === "text") {
    if (!isNum(element.attrs.size)) report.warn(`${ctx}: size should be a number (got "${element.attrs.size ?? ""}")`);
    if (!isNum(element.attrs.wrapWidth)) report.warn(`${ctx}: wrapWidth should be a number`);
    const align = element.attrs.align;
    if (align !== undefined && !["left", "center", "right"].includes(align)) {
      report.warn(`${ctx}: align should be left/center/right (got "${align}")`);
    }
    if (!element.attrs.font) report.warn(`${ctx}: missing font`);
    if (!entries(element.children).some((c) => c.name === "content")) report.warn(`${ctx}: missing <content>`);
  }

  const parent = element.attrs.parent;
  if (parent !== undefined && !allIds.has(Number(parent))) {
    report.error(`${ctx}: parent "${parent}" does not reference an element in this scene`);
  }
}

// ---------------------------------------------------------------------------
// Scene validation
// ---------------------------------------------------------------------------

function validateScene(document: unknown[], report: Report): void {
  const scene = findEntry(document, "scene");
  if (!scene) {
    report.error("root element must be <scene>");
    return;
  }

  for (const attr of REQUIRED_SCENE_ATTRS) {
    if (scene.attrs[attr] === undefined) report.error(`<scene> missing required attribute "${attr}"`);
  }
  for (const attr of RECOMMENDED_SCENE_ATTRS) {
    if (scene.attrs[attr] === undefined) report.warn(`<scene> missing recommended attribute "${attr}"`);
  }

  for (const [attr, value] of Object.entries(scene.attrs)) {
    if (["width", "height", "exportWidth", "exportHeight", "totalTime", "tileCount"].includes(attr) && !isInt(value)) {
      report.error(`<scene> ${attr} must be an integer (got "${value}")`);
    }
  }
  if (scene.attrs.bgcolor !== undefined && !COLOR.test(scene.attrs.bgcolor)) {
    report.error(`<scene> bgcolor must be #AARRGGBB (got "${scene.attrs.bgcolor}")`);
  }
  if (isNum(scene.attrs.totalTime) && Number(scene.attrs.totalTime) <= 0) {
    report.error("<scene> totalTime must be greater than 0");
  }
  if (isNum(scene.attrs.fps) && !STANDARD_FPS.has(Number(scene.attrs.fps))) {
    report.warn(`<scene> fps ${scene.attrs.fps} is not a standard frame rate`);
  }

  // Attribute order.
  let previous = -1;
  for (const attr of Object.keys(scene.attrs)) {
    const index = SCENE_ATTR_ORDER.indexOf(attr);
    if (index === -1) continue;
    if (index < previous) report.warn(`<scene> attribute "${attr}" is out of order`);
    previous = Math.max(previous, index);
  }

  // Elements.
  const elements = collectElements(scene);
  const allIds = new Set<number>();
  const idCounts = new Map<number, number>();
  for (const element of elements) {
    if (isInt(element.attrs.id)) {
      const id = Number(element.attrs.id);
      allIds.add(id);
      idCounts.set(id, (idCounts.get(id) ?? 0) + 1);
    }
  }
  for (const element of elements) validateElement(element, allIds, idCounts, report);

  // ffver consistency.
  const hasSpeedMap = elements.some((element) =>
    entries(element.children).some((child) =>
      child.name === "speedMap" && entries(child.children).filter((c) => c.name === "kf").length > 1));
  const type = scene.attrs.type;
  if (type !== undefined && type !== type.toLowerCase()) {
    report.warn(`<scene> type should be lowercase (got "${type}")`);
  }
  const expected = hasSpeedMap ? 108 : type === "preset" ? 107 : 106;
  if (scene.attrs.ffver !== undefined && Number(scene.attrs.ffver) !== expected) {
    report.warn(`<scene> ffver is ${scene.attrs.ffver} but expected ${expected}${type === "preset" ? " (preset)" : ""}${hasSpeedMap ? " (>1-keyframe speedMap)" : ""}`);
  }

  const bookmarks = entries(scene.children).filter((c) => c.name === "bookmark");
  for (const bookmark of bookmarks) {
    if (!isNum(bookmark.attrs.t)) report.warn("<bookmark> missing/invalid t");
  }
  const medias = entries(scene.children).filter((c) => c.name === "media");
  for (const media of medias) {
    if (!media.attrs.uri) report.warn("<media> missing uri");
    if (!media.attrs.type) report.warn("<media> missing type");
  }
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function resolveTargets(argv: string[]): string[] {
  const files = argv.filter((arg) => !arg.startsWith("-"));
  if (files.length > 0) return files;
  return readdirSync(ROOT).filter((file) => file.endsWith(".xml")).map((file) => join(ROOT, file));
}

const args = process.argv.slice(2);
const strict = args.includes("--strict");
const targets = resolveTargets(args);

if (targets.length === 0) {
  console.error("usage: bun run scripts/validate-scene.ts <file.xml> [more.xml ...]");
  process.exit(2);
}

let totalErrors = 0;
let totalWarnings = 0;

console.log(`Validating ${targets.length} scene file(s) against the Alight Motion import format…\n`);

for (const target of targets) {
  const report = new Report();
  let document: unknown[];
  try {
    document = parseXml(read(target));
  } catch (error) {
    console.log(`${basename(target)}`);
    console.log(`  error: cannot parse XML (${(error as Error).message})\n`);
    totalErrors += 1;
    continue;
  }

  validateScene(document, report);

  const name = basename(target);
  if (report.issues.length === 0) {
    console.log(`${name}\n  ok: no problems found\n`);
    continue;
  }

  console.log(name);
  const sorted = [...report.issues].sort((a, b) => (a.level === b.level ? 0 : a.level === "error" ? -1 : 1));
  for (const issue of sorted) {
    console.log(`  ${issue.level === "error" ? "error" : "warn "}: ${issue.msg}`);
  }
  console.log("");

  totalErrors += report.errorCount;
  totalWarnings += report.warnCount;
}

const failed = totalErrors > 0 || (strict && totalWarnings > 0);
console.log(`${failed ? "FAIL" : "PASS"} — ${targets.length} file(s), ${totalErrors} error(s), ${totalWarnings} warning(s)`);
process.exit(failed ? 1 : 0);
