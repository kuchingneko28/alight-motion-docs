interface HomeStats {
  effects: number;
  categories: number;
  shapes: number;
  blendModes: number;
  apkVersion: string;
  membersOnly: number;
}

const THEME_CSS = `:root {
  --vp-c-bg: #eff1f5;
  --vp-c-bg-alt: #e6e9ef;
  --vp-c-bg-elv: #ffffff;
  --vp-c-bg-soft: #e6e9ef;
  --vp-c-text-1: #4c4f69;
  --vp-c-text-2: #6c6f85;
  --vp-c-text-3: #9ca0b0;
  --vp-c-border: #ccd0da;
  --vp-c-divider: #ccd0da;
  --vp-c-gutter: #ccd0da;
  --vp-c-brand-1: #1e66f5;
  --vp-c-brand-2: #209fb5;
  --vp-c-brand-3: #1e66f5;
  --vp-c-brand-soft: rgba(30, 102, 245, 0.16);
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: linear-gradient(135deg, #1e66f5, #7287fd);
  --vp-button-brand-border: transparent;
  --vp-button-brand-text: #ffffff;
  --vp-button-brand-bg: #1e66f5;
  --vp-button-brand-hover-border: transparent;
  --vp-button-brand-hover-text: #ffffff;
  --vp-button-brand-hover-bg: #209fb5;
  --vp-button-alt-border: #1e66f540;
  --vp-button-alt-bg: transparent;
  --vp-button-alt-hover-border: #1e66f5;
  --vp-button-alt-hover-bg: #1e66f510;
  --vp-custom-block-info-border: #1e66f5;
  --vp-custom-block-info-text: #1e66f5;
  --vp-code-block-bg: #1e1e2e;
}
.dark {
  --vp-c-bg: #1e1e2e;
  --vp-c-bg-alt: #181825;
  --vp-c-bg-elv: #1e1e2e;
  --vp-c-bg-soft: #313244;
  --vp-c-text-1: #cdd6f4;
  --vp-c-text-2: #a6adc8;
  --vp-c-text-3: #6c7086;
  --vp-c-border: #313244;
  --vp-c-divider: #313244;
  --vp-c-gutter: #313244;
  --vp-c-brand-1: #89b4fa;
  --vp-c-brand-2: #74c7ec;
  --vp-c-brand-3: #89b4fa;
  --vp-c-brand-soft: rgba(137, 180, 250, 0.16);
  --vp-home-hero-name-background: linear-gradient(135deg, #89b4fa, #b4befe);
  --vp-button-brand-bg: #89b4fa;
  --vp-button-brand-hover-bg: #74c7ec;
  --vp-button-alt-border: #89b4fa40;
  --vp-button-alt-hover-border: #89b4fa;
  --vp-button-alt-hover-bg: #89b4fa10;
  --vp-custom-block-info-border: #89b4fa;
  --vp-custom-block-info-text: #89b4fa;
  --vp-code-block-bg: #313244;
}
.vp-doc a { color: var(--vp-c-brand-1); }
.vp-doc a:hover { color: var(--vp-c-brand-2); }`;

export function buildConfig(effectsSidebar: string): string {
  const base = process.env.VITEPRESS_BASE ?? "/";
  return `import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '${base}',
  title: "Alight Motion Docs",
  description: "Community documentation for Alight Motion — effects, elements, shapes, and blend modes.",
  head: [
    ['meta', { name: 'theme-color', content: '#1e66f5' }],
    ['style', {}, \`
${THEME_CSS}
\`],
  ],
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide' },
      { text: 'Effects', link: '/effects/' },
      { text: 'Shapes', link: '/shapes/' },
      { text: 'Elements', link: '/elements/' },
      { text: 'Blend Modes', link: '/blend-modes/' },
      { text: 'Authoring', link: '/authoring' },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/kuchingneko28/alight-motion-docs' },
    ],

    sidebar: [
        {
          text: 'Getting Started',
          items: [
            { text: 'Guide', link: '/guide' },
            { text: 'Project & Preset Format', link: '/authoring' },
          ]
        },
${effectsSidebar},
        {
          text: 'Reference',
          items: [
            { text: 'Shape Templates', link: '/shapes/' },
            { text: 'Element Types', link: '/elements/' },
            { text: 'Blend Modes', link: '/blend-modes/' },
          ]
        }
    ],

    search: {
      provider: 'local'
    },

    footer: {
      message: 'Community documentation — not affiliated with Alight Creative.',
    }
  }
})
`;
}

export function buildHomepage(stats: HomeStats): string {
  return `---
layout: home
title: Alight Motion Docs
description: Community documentation for Alight Motion — effects, elements, shapes, and blend modes.

hero:
  name: "Alight Motion"
  text: "Complete Reference"
  tagline: "${stats.effects} effects · ${stats.shapes} shapes · ${stats.blendModes} blend modes · ${stats.categories} categories"
  actions:
    - theme: brand
      text: Browse All Effects
      link: /effects/
    - theme: alt
      text: Getting Started Guide
      link: /guide

features:
  - icon: 🎛️
    title: Complete Effects Database
    details: ${stats.effects} effects across ${stats.categories} categories with parameter tables, official thumbnails, and layer compatibility — extracted from Alight Motion v${stats.apkVersion}.
  - icon: 🔷
    title: Element Types & Shapes
    details: 7 layer types with capability documentation and ${stats.shapes} built-in parametric shapes with rendered SVG previews.
  - icon: 🎨
    title: Blend Modes
    details: All ${stats.blendModes} blend modes documented and grouped by visual function — Darken, Lighten, Contrast, Difference, and Color.
  - icon: 🔒
    title: Membership Indicators
    details: ${stats.membersOnly} of ${stats.effects} effects require a paid subscription. Every members-only effect is clearly marked.
---
`;
}
