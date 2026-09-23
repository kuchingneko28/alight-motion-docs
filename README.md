# Alight Motion Docs

Community documentation for **Alight Motion**, generated from the decompiled APK. It
covers the app's effects, shape templates, element (layer) types, blend modes, and the
project/preset XML format.

The site is built with [VitePress](https://vitepress.dev) and published to GitHub Pages.

## What's inside

- **Guide** — layer types, common properties, effects, shapes, blend modes, keyframes.
- **Effects** — 196 effects across 12 categories, with 3-column parameter tables,
  official thumbnails, layer compatibility, and each effect's canonical `<effect id>`.
- **Shapes** — built-in parametric shape templates with rendered SVG previews and
  `s=".slug"` project references.
- **Elements** — the 7 layer types with properties, capabilities, and limitations.
- **Blend Modes** — all 24 modes grouped by visual function.
- **Authoring** — [Project & Preset Format](/docs/authoring.md): scene XML, defaults,
  ID allocation, layer naming, elements, effects, properties/keyframes, media.

Machine-readable data is emitted to `docs/public/catalog.json`, with an
`docs/public/llms.txt` index for tooling and LLMs.

## LLM bundle

For feeding everything to a language model (e.g. a Claude project), the generator also
emits a plain-markdown bundle into `docs/public/llm/`:

- `00-system-prompt.md` — paste into the project's custom instructions.
- `01-overview.md`, `02-project-and-preset-format.md`, `03-editing-guide.md`,
  `04-element-types.md`, `05-shape-templates.md`, `06-blend-modes.md`.
- `07-effects/` — one file per effect category (`color.md`, `distort.md`, …) plus an index.
- `08-examples.md` — complete example scenes.
- `catalog.json` — the machine-readable catalog.

There is no HTML, frontmatter, or image markup in these files, so they upload cleanly as
knowledge. Regenerate with `bun run docs:generate`.

## Examples

`examples/` holds complete scene files (color grades and a glow) that are checked by
`bun run docs:validate` in CI and bundled into the LLM docs as `08-examples.md`.

## Requirements

- [Bun](https://bun.sh) (do not use npm/pnpm/yarn)

## Development

```bash
bun install
bun run docs:dev       # dev server
bun run docs:generate  # regenerate pages from the APK data
bun run docs:build     # generate + VitePress production build
bun run docs:preview   # preview the production build
bun run docs:check-links  # verify internal links/anchors in the build
bun run docs:validate <file.xml>  # validate a scene/project XML
```

On a fresh clone run `bun run docs:generate` before `bun run docs:dev`, since the
generated Markdown is not committed.

## Source of truth

Everything under `docs/` is generated from the decompiled APK, except
`docs/guide.md`, `docs/authoring.md`, and `docs/.vitepress/theme/style.css`:

| Data | Location |
| --- | --- |
| Effects & blend modes | `decompiled_apk/assets/effects/*.xml` |
| Shapes | `decompiled_apk/assets/shapes/*.xml` |
| Strings | `decompiled_apk/res/values/strings.xml` |
| Version | `decompiled_apk/apktool.yml` |

To change generated output, edit `scripts/generate.ts` or a module in `scripts/lib/`
(see `AGENTS.md`).

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site with
`VITEPRESS_BASE=/alight-motion-docs/` and deploys it to GitHub Pages. Pull requests run
`.github/workflows/ci.yml` (build, example-scene validation, and link check).

> Community documentation — not affiliated with Alight Creative.
