import { rmSync, existsSync, writeFileSync } from "fs";
import { join } from "path";
import { CONFIG_FILE, DOCS_DIR, THUMB_DEST, ensureDir, getApkVersion, parseStrings } from "./lib/apk";
import {
  buildEffectPage, buildEffectsIndex, buildEffectsSidebar,
  copyThumbnails, groupByCategory, parseEffects,
} from "./lib/effects";
import { generateShapes } from "./lib/shapes";
import { generateBlendModes, generateElements } from "./lib/reference";
import { buildConfig, buildHomepage } from "./lib/site";

const EFFECTS_DOCS_DIR = join(DOCS_DIR, "effects");

const GENERATED_DIRS = [
  EFFECTS_DOCS_DIR,
  THUMB_DEST,
  join(DOCS_DIR, "elements"),
  join(DOCS_DIR, "shapes"),
  join(DOCS_DIR, "blend-modes"),
  join(DOCS_DIR, "public/shapes"),
  join(DOCS_DIR, "public/effects/thumb"),
  join(DOCS_DIR, "transitions"),
  join(DOCS_DIR, "public/features"),
];

function clean(): void {
  for (const dir of GENERATED_DIRS) {
    if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
  }
}

function main(): void {
  console.log(`APK version: ${getApkVersion()}`);
  const strings = parseStrings();
  console.log(`Loaded ${strings.size} strings`);

  clean();

  const effects = parseEffects(strings);
  console.log(`Parsed ${effects.length} effects`);

  const { copied, missing } = copyThumbnails(effects);
  console.log(`Copied ${copied} thumbnails (${missing} missing)`);

  const byCategory = groupByCategory(effects);
  for (const [category, list] of byCategory) {
    ensureDir(join(EFFECTS_DOCS_DIR, category));
    for (const effect of list) {
      writeFileSync(join(EFFECTS_DOCS_DIR, category, `${effect.slug}.md`), buildEffectPage(effect), "utf-8");
    }
  }
  writeFileSync(join(EFFECTS_DOCS_DIR, "index.md"), buildEffectsIndex(byCategory), "utf-8");

  const shapes = generateShapes(strings);
  generateElements();
  const blendModes = generateBlendModes(strings);

  writeFileSync(CONFIG_FILE, buildConfig(buildEffectsSidebar(byCategory)), "utf-8");
  writeFileSync(
    join(DOCS_DIR, "index.md"),
    buildHomepage({
      effects: effects.length,
      categories: byCategory.size,
      shapes,
      blendModes,
      apkVersion: getApkVersion(),
      membersOnly: effects.filter((effect) => effect.membersOnly).length,
    }),
    "utf-8",
  );

  console.log(`Done: ${effects.length} effects, ${shapes} shapes, ${blendModes} blend modes.`);
  console.log("Run 'bun run docs:dev' to preview.");
}

main();
