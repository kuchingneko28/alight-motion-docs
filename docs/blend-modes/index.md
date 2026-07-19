---
title: Blend Modes
description: All 24 blend modes in Alight Motion — with GLSL shader source code.
---

# Blend Modes

Alight Motion supports **24 blend modes** grouped into categories.

> See the [Getting Started Guide](/guide#blend-modes) for a quick overview of blend modes and when to use each category.

## Darken

- [Color Burn](/blend-modes/color-burn) — Darkens the bottom layer by inverting, dividing, and inverting. White has no effect, black makes black.
- [Darken](/blend-modes/darken) — Keeps the darker of the two color channels (R, G, B independently).
- [Darker Color](/blend-modes/darker-color) — Compares the overall brightness of top and bottom — keeps the darker pixel entirely.
- [Linear Burn](/blend-modes/linear-burn) — Adds the inverse of the top and bottom colors and inverts the result. Darkens — white has no effect.
- [Subtract](/blend-modes/subtract) — Subtracts the top color from the bottom color. Darkens the result. White in the top layer makes black.

## Lighten

- [Color Dodge](/blend-modes/color-dodge) — Brightens the bottom layer by dividing by the inverse of the top layer. White turns white, black has no effect.
- [Divide](/blend-modes/divide) — Divides the bottom color by the top color. Brightens the result. Black in the top layer makes white.
- [Lighten](/blend-modes/lighten) — Keeps the lighter of the two color channels (R, G, B independently).
- [Lighter Color](/blend-modes/lighter-color) — Compares the overall brightness of top and bottom — keeps the lighter pixel entirely.
- [Linear Dodge](/blend-modes/linear-dodge) — Adds the top and bottom colors together. Lightens the result — black has no effect.

## Contrast

- [Hard Light](/blend-modes/hard-light) — Like Overlay but with the roles of top and bottom swapped. The top layer controls the contrast effect.
- [Linear Light](/blend-modes/linear-light) — Combines Linear Dodge and Linear Burn. Burns or dodges based on the top layer.
- [Overlay](/blend-modes/overlay) — Combines Multiply and Screen. Dark areas get darker, light areas get lighter, midtones are preserved.
- [Pin Light](/blend-modes/pin-light) — Replaces colors based on the top layer. If the top is darker than 50%, dark pixels pass through.
- [Soft Light](/blend-modes/soft-light) — A softer version of Overlay. Darkens or lightens the bottom layer based on the top layer's luminance.
- [Soft Overlay](/blend-modes/soft-overlay) — A very soft overlay effect — subtle contrast enhancement.
- [Vivid Light](/blend-modes/vivid-light) — Combines Color Dodge and Color Burn. Dodges or burns based on the top layer's luminance.

## Difference

- [Difference](/blend-modes/diff) — Subtracts the darker from the lighter, channel by channel. Black produces no change, white inverts.
- [Exclusion](/blend-modes/exclusion) — Similar to Difference but with lower contrast. Black produces no change, white inverts to ~50% gray.

## Color

- [Color Multiply](/blend-modes/color-multiply) — Multiplies colors while preserving luminance of the bottom layer.
- [Color](/blend-modes/color) — Takes the hue + saturation of the top layer and the luminance of the bottom layer.
- [Hue](/blend-modes/hue) — Takes the hue of the top layer and the saturation + luminance of the bottom layer.
- [Luminance](/blend-modes/luminance) — Takes the luminance of the top layer and the hue + saturation of the bottom layer.
- [Saturation](/blend-modes/saturation) — Takes the saturation of the top layer and the hue + luminance of the bottom layer.
