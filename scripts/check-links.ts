import { readFileSync, readdirSync, existsSync, statSync } from "fs";
import { join, relative, dirname, extname } from "path";
import { DOCS_DIR } from "./lib/apk";

const DIST = join(DOCS_DIR, ".vitepress", "dist");
const BASE = process.env.VITEPRESS_BASE && process.env.VITEPRESS_BASE.endsWith("/")
  ? process.env.VITEPRESS_BASE
  : (process.env.VITEPRESS_BASE ?? "/");

const SKIP = /^(https?:|mailto:|tel:|data:|javascript:|#)/;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...walk(path));
    else if (name.endsWith(".html")) out.push(path);
  }
  return out;
}

function resolveTarget(href: string, sourceDir: string): string | null {
  let path = href;
  if (path.startsWith(BASE)) path = path.slice(BASE.length);
  else if (path.startsWith("/")) path = path.slice(1);
  else return join(sourceDir, path); // relative link

  if (path === "") return "index.html";
  if (path.endsWith("/")) return `${path}index.html`;
  if (extname(path)) return path;
  return `${path}.html`;
}

function hasAnchor(file: string, anchor: string): boolean {
  if (!file.endsWith(".html") || !existsSync(join(DIST, file))) return true;
  const html = readFileSync(join(DIST, file), "utf-8");
  const decoded = decodeURIComponent(anchor);
  return html.includes(`id="${decoded}"`) || html.includes(`name="${decoded}"`);
}

function main(): void {
  if (!existsSync(DIST)) {
    console.error(`No build found at ${DIST}. Run 'bun run docs:build' first.`);
    process.exit(1);
  }

  const pages = walk(DIST);
  const errors: string[] = [];
  const attr = /(?:href|src)="([^"]+)"/g;

  for (const page of pages) {
    const sourceDir = dirname(relative(DIST, page));
    const html = readFileSync(page, "utf-8");
    for (const match of html.matchAll(attr)) {
      const raw = match[1]!.replace(/&amp;/g, "&");
      if (SKIP.test(raw)) continue;

      const [path, hash] = raw.split("#");
      const target = resolveTarget(path!, sourceDir);
      if (target === null) continue;

      if (!existsSync(join(DIST, target))) {
        errors.push(`${relative(DIST, page)} → missing ${raw}`);
        continue;
      }
      if (hash && !hasAnchor(target, hash)) {
        errors.push(`${relative(DIST, page)} → missing anchor #${hash} in ${path}`);
      }
    }
  }

  if (errors.length > 0) {
    console.error(`✗ ${errors.length} broken link(s):`);
    for (const error of errors) console.error(`  ${error}`);
    process.exit(1);
  }
  console.log(`✓ Checked ${pages.length} pages — no broken internal links.`);
}

main();
