import { writeFileSync } from "fs";
import { join } from "path";
import { DOCS_DIR } from "./apk";
import type { Effect } from "./effects";
import { SHAPE_DESCRIPTIONS, type Shape } from "./shapes";
import { ELEMENT_TYPES, type BlendMode } from "./reference";

const SITE_URL = "https://kuchingneko28.github.io";

export interface CatalogInput {
  apkVersion: string;
  effects: Effect[];
  shapes: Shape[];
  blendModes: BlendMode[];
}

function siteBase(): string {
  const base = process.env.VITEPRESS_BASE ?? "/";
  return base.endsWith("/") ? base : `${base}/`;
}

function url(path: string): string {
  return `${SITE_URL}${siteBase()}${path.replace(/^\//, "")}`;
}

function serializeParams(params: { id: string; label: string; type: string; default?: string; min?: string; max?: string; step?: string; choices?: { label: string }[] }[]) {
  return params
    .filter((param) => param.type !== "section")
    .map((param) => ({
      id: param.id,
      name: param.label,
      type: param.type,
      default: param.default ?? null,
      min: param.min ?? null,
      max: param.max ?? null,
      step: param.step ?? null,
      choices: param.choices?.map((choice) => choice.label) ?? null,
    }));
}

export function buildCatalog({ apkVersion, effects, shapes, blendModes }: CatalogInput): string {
  const catalog = {
    name: "Alight Motion Docs",
    description: "Reverse-engineered reference for Alight Motion — effects, shapes, element types, blend modes, and the project/preset XML format.",
    apkVersion,
    site: `${SITE_URL}${siteBase()}`,
    docs: {
      guide: url("guide"),
      authoring: url("authoring"),
      effects: url("effects/"),
      shapes: url("shapes/"),
      elements: url("elements/"),
      blendModes: url("blend-modes/"),
    },
    effects: effects.map((effect) => ({
      slug: effect.slug,
      id: effect.id,
      name: effect.name,
      category: effect.category,
      description: effect.desc,
      membersOnly: effect.membersOnly,
      experimental: effect.experimental,
      affinity: effect.affinity ?? null,
      tags: effect.tags,
      params: serializeParams(effect.params),
    })),
    shapes: shapes.map((shape) => ({
      slug: shape.slug,
      id: shape.id,
      name: shape.name,
      description: SHAPE_DESCRIPTIONS[shape.slug] ?? "",
      projectRef: `.${shape.slug}`,
      params: shape.params.map((param) => ({
        id: param.id,
        name: param.label,
        type: param.type,
        default: param.default ?? null,
        min: param.min ?? null,
        max: param.max ?? null,
        step: param.step ?? null,
      })),
    })),
    elements: ELEMENT_TYPES.map((element) => ({
      id: element.id,
      name: element.name,
      description: element.description,
      properties: element.properties,
      capabilities: element.capabilities,
      limitations: element.limitations ?? [],
    })),
    blendModes: blendModes.map((mode) => ({
      slug: mode.slug,
      name: mode.name,
      category: mode.category,
      description: mode.description,
    })),
  };
  return JSON.stringify(catalog, null, 2);
}

export function buildLlmsTxt({ apkVersion, effects, shapes, blendModes }: CatalogInput): string {
  const lines = [
    "# Alight Motion Docs",
    "",
    `> Community reference for Alight Motion (APK v${apkVersion}): ${effects.length} effects, ${shapes.length} shape templates, ${ELEMENT_TYPES.length} element types, ${blendModes.length} blend modes, and the documented project/preset XML format.`,
    "",
    "## Start here",
    "",
    `- [Project & Preset Format](${url("authoring")}): scene XML, defaults, ID allocation, naming, elements, effects, keyframes.`,
    `- [Getting Started Guide](${url("guide")}): layer types, common properties, keyframes.`,
    "",
    "## Reference",
    "",
    `- [Effects](${url("effects/")}): every effect with parameters, defaults, and its canonical \`<effect id>\`.`,
    `- [Shape Templates](${url("shapes/")}): every shape with its \`s=".slug"\` reference and parameters.`,
    `- [Element Types](${url("elements/")}): layer types and capabilities.`,
    `- [Blend Modes](${url("blend-modes/")}): all blend modes by category.`,
    "",
    "## Machine-readable",
    "",
    `- [catalog.json](${url("catalog.json")}): effects, shapes, elements, and blend modes with canonical ids and parameters.`,
    "",
    "## Notes",
    "",
    "- Effect `id` values are the canonical XML ids and do not always match the effect file name.",
    "- Shape project references use the form `s=\".<slug>\"`.",
    "- Properties equal to their default may be omitted when generating project XML.",
    "- This documentation is unaffiliated with Alight Creative.",
    "",
  ];
  return lines.join("\n");
}

export function generateCatalog(input: CatalogInput): void {
  writeFileSync(join(DOCS_DIR, "public", "catalog.json"), buildCatalog(input), "utf-8");
  writeFileSync(join(DOCS_DIR, "public", "llms.txt"), buildLlmsTxt(input), "utf-8");
}
