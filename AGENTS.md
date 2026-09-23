# Agent Instructions

## Key Gotchas & Code Generation

- **Do not edit generated files directly.** Everything below is produced by `bun run docs:generate`:
  - `docs/index.md`, `docs/.vitepress/config.ts`
  - `docs/effects/` and `docs/effects/index.md`
  - `docs/elements/index.md`
  - `docs/shapes/index.md`
  - `docs/blend-modes/index.md`
  - `docs/public/effects/thumb/` and `docs/public/shapes/`
  - `docs/public/catalog.json` and `docs/public/llms.txt`
  - To change them, edit `scripts/generate.ts` or a file in `scripts/lib/`.
  - `docs/guide.md`, `docs/authoring.md`, `docs/public/favicon.svg`, and `docs/.vitepress/theme/style.css` are safe to edit by hand.

- **Generator layout** (`scripts/`):
  - `generate.ts` — entry point; cleans output, runs each section, writes config + homepage.
  - `lib/apk.ts` — paths, string resolution, APK version, and the XML helpers (`parseXml`, `entries`, `findEntry`) built on `fast-xml-parser` with `preserveOrder`.
  - `lib/effects.ts` — parses `assets/effects/*.xml`, resolves thumbnails, builds pages/index/sidebar.
  - `lib/shapes.ts` — parses `assets/shapes/*.xml` and renders SVG previews in a `vm` sandbox.
  - `lib/reference.ts` — Element types and blend modes (blend shaders are intentionally not published).
  - `lib/catalog.ts` — machine-readable `catalog.json` and `llms.txt`.
  - `lib/site.ts` — VitePress config (nav/sidebar, sitemap, OG meta, edit links), theme CSS, and homepage.
  - `check-links.ts` — validates internal links/anchors in the built site (`bun run docs:check-links`).

- **Source of truth** (raw data extracted from the APK):
  - Effects XML: `decompiled_apk/assets/effects/`
  - Shapes XML: `decompiled_apk/assets/shapes/`
  - Translations/Strings: `decompiled_apk/res/values/strings.xml`
  - APK version: `decompiled_apk/apktool.yml`

- **Thumbnails:** the `thumb` attribute in effect XML is often stale. Thumbnails are resolved by normalizing the effect's display name against `assets/effects/thumb/` (a small override map handles the rest).

- **SVG generation:** shape previews run the `<script>` block from each shape XML inside a `vm` sandbox (see `scripts/lib/shapes.ts`).

## Developer Workflow

Use **Bun** (do not use npm/pnpm/yarn).

- **Install dependencies:** `bun install`
- **Generate docs:** `bun run docs:generate` (required before `docs:dev` on a fresh clone)
- **Rebuild + build:** `bun run build` (runs generator then VitePress build)
- **Start dev server:** `bun run docs:dev`
