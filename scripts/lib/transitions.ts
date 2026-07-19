import { writeFileSync } from "fs";
import { join } from "path";
import {
  DOCS_DIR, STRINGS_FILE,
  readFile, ensureDir, parseStrings,
} from "./utils";

interface TransitionPreset {
  slug: string;
  name: string;
  direction: "in" | "out";
}

const TRANSITIONS_DOCS_DIR = join(DOCS_DIR, "transitions");

function buildTransitionsIndex(presets: TransitionPreset[]): string {
  const inPresets = presets.filter(p => p.direction === "in");
  const outPresets = presets.filter(p => p.direction === "out");

  let lines: string[] = [];
  lines.push(`---`);
  lines.push(`title: Transition Presets`);
  lines.push(`description: All transition presets in Alight Motion — pre-configured effects for animating layers on and off screen.`);
  lines.push(`---`);
  lines.push(``);
  lines.push(`# Transition Presets`);
  lines.push(``);
  lines.push(`Alight Motion includes **${presets.length} transition presets** — pre-configured effect setups that animate layers on or off screen.`);
  lines.push(``);
  lines.push(`Transition presets use combinations of existing effects (Wipe, Dissolve, Lightning, etc.) with specific parameter settings to create smooth scene transitions. They are found in the **Presets** panel when editing an effect.`);
  lines.push(``);
  lines.push(`> See the [Getting Started Guide](/guide#animation-keyframes) for keyframe animation basics.`);
  lines.push(``);
  lines.push(`## Transition In (${inPresets.length})`);
  lines.push(``);
  lines.push(`Apply these to animate a layer **appearing** on screen.`);
  lines.push(``);
  for (const p of inPresets) {
    lines.push(`- **${p.name}** — \`${p.slug}\``);
  }
  lines.push(``);
  lines.push(`## Transition Out (${outPresets.length})`);
  lines.push(``);
  lines.push(`Apply these to animate a layer **disappearing** off screen.`);
  lines.push(``);
  for (const p of outPresets) {
    lines.push(`- **${p.name}** — \`${p.slug}\``);
  }
  lines.push(``);
  lines.push(`## How Transitions Work`);
  lines.push(``);
  lines.push(`Transition presets are pre-configured **effect presets** — they bundle one or more effects with:`,);
  lines.push(``);
  lines.push(`- **Keyframed parameters** — values animated from start to end over time`);
  lines.push(`- **Specific effect choices** — tailored for each transition style (wipe, glow, spin, etc.)`);
  lines.push(`- **Suggested duration** — typically 0.5–1.5 seconds`);
  lines.push(``);
  lines.push(`To use a transition preset:`);
  lines.push(``);
  lines.push(`1. Select the layer you want to transition`);
  lines.push(`2. Tap **Effects → Presets**`);
  lines.push(`3. Choose **Transition In** or **Transition Out**`);
  lines.push(`4. Pick a style and adjust timing as needed`);
  lines.push(``);
  lines.push(`### Related Effects`);
  lines.push(``);
  lines.push(`These effects are commonly used in transition presets:`);
  lines.push(``);
  lines.push(`- [Dissolve](/effects/opacity/dissolve) — pixel dissolve transition`);
  lines.push(`- [Wipe](/effects/matte/wipe2) — rectangular mask wipe`);
  lines.push(`- [Radial Wipe](/effects/matte/radialwipe) — circular wipe transition`);

  return lines.join("\n");
}

export function getTransitionsSidebarGroup(): string {
  const stringsXml = readFile(STRINGS_FILE);
  const strings = parseStrings(stringsXml);
  const presets = collectTransitions(strings);
  const inCount = presets.filter(p => p.direction === "in").length;
  const outCount = presets.filter(p => p.direction === "out").length;

  return `      {
        text: 'Transition Presets (${presets.length})',
        collapsed: true,
        items: [
          { text: 'Overview', link: '/transitions/' },
          { text: 'Transition In (${inCount})', link: '/transitions/#transition-in' },
          { text: 'Transition Out (${outCount})', link: '/transitions/#transition-out' }
        ]
      }`;
}

function collectTransitions(strings: Map<string, string>): TransitionPreset[] {
  const presets: TransitionPreset[] = [];
  for (const [key, name] of strings) {
    if (key.startsWith("effectpreset_transition_in")) {
      const slug = key.replace(/^effectpreset_/, "");
      presets.push({ slug, name, direction: "in" });
    } else if (key.startsWith("effectpreset_transition_out")) {
      const slug = key.replace(/^effectpreset_/, "");
      presets.push({ slug, name, direction: "out" });
    }
  }
  return presets;
}

export function generateTransitionPages(): void {
  console.log("\nGenerating transition preset pages...");
  ensureDir(TRANSITIONS_DOCS_DIR);

  const stringsXml = readFile(STRINGS_FILE);
  const strings = parseStrings(stringsXml);
  const presets = collectTransitions(strings);

  const indexPath = join(TRANSITIONS_DOCS_DIR, "index.md");
  const content = buildTransitionsIndex(presets);
  writeFileSync(indexPath, content, "utf-8");
  console.log(`  Wrote ${indexPath} (${presets.length} presets)`);
}
