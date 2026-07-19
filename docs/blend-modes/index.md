---
title: Blend Modes
description: All 24 blend modes in Alight Motion — grouped by visual function.
---

# Blend Modes

Alight Motion supports **24 blend modes** grouped into visual categories.

> See the [Getting Started Guide](/guide#blend-modes) for a quick overview of blend modes and when to use each category.

## [Darken](/blend-modes/darken)

- **Color Burn** — Darkens the bottom layer by inverting, dividing, and inverting. White has no effect, black makes black.
- **Darken** — Keeps the darker of the two color channels (R, G, B independently).
- **Darker Color** — Compares the overall brightness of top and bottom — keeps the darker pixel entirely.
- **Linear Burn** — Adds the inverse of the top and bottom colors and inverts the result. Darkens — white has no effect.
- **Subtract** — Subtracts the top color from the bottom color. Darkens the result. White in the top layer makes black.

## [Lighten](/blend-modes/lighten)

- **Color Dodge** — Brightens the bottom layer by dividing by the inverse of the top layer. White turns white, black has no effect.
- **Divide** — Divides the bottom color by the top color. Brightens the result. Black in the top layer makes white.
- **Lighten** — Keeps the lighter of the two color channels (R, G, B independently).
- **Lighter Color** — Compares the overall brightness of top and bottom — keeps the lighter pixel entirely.
- **Linear Dodge** — Adds the top and bottom colors together. Lightens the result — black has no effect.

## [Contrast](/blend-modes/contrast)

- **Hard Light** — Like Overlay but with the roles of top and bottom swapped. The top layer controls the contrast effect.
- **Linear Light** — Combines Linear Dodge and Linear Burn. Burns or dodges based on the top layer.
- **Overlay** — Combines Multiply and Screen. Dark areas get darker, light areas get lighter, midtones are preserved.
- **Pin Light** — Replaces colors based on the top layer. If the top is darker than 50%, dark pixels pass through.
- **Soft Light** — A softer version of Overlay. Darkens or lightens the bottom layer based on the top layer's luminance.
- **Soft Overlay** — A very soft overlay effect — subtle contrast enhancement.
- **Vivid Light** — Combines Color Dodge and Color Burn. Dodges or burns based on the top layer's luminance.

## [Difference](/blend-modes/difference)

- **Difference** — Subtracts the darker from the lighter, channel by channel. Black produces no change, white inverts.
- **Exclusion** — Similar to Difference but with lower contrast. Black produces no change, white inverts to ~50% gray.

## [Color](/blend-modes/color)

- **Color Multiply** — Multiplies colors while preserving luminance of the bottom layer.
- **Color** — Takes the hue + saturation of the top layer and the luminance of the bottom layer.
- **Hue** — Takes the hue of the top layer and the saturation + luminance of the bottom layer.
- **Luminance** — Takes the luminance of the top layer and the hue + saturation of the bottom layer.
- **Saturation** — Takes the saturation of the top layer and the hue + luminance of the bottom layer.
