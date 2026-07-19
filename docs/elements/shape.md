---
title: Shape Element
description: "The most common layer type. Shapes can be rectangles, ellipses, polygons, stars, arcs, or any of the 20 built-in shape templates. Every shape has a fill (solid color, gradient, or media) and optional stroke. Shapes are fully renderable and support all visual properties."
---

# Shape Element

> The most common layer type. Shapes can be rectangles, ellipses, polygons, stars, arcs, or any of the 20 built-in shape templates. Every shape has a fill (solid color, gradient, or media) and optional stroke. Shapes are fully renderable and support all visual properties.

## Properties

<table>
<thead><tr><th>Property</th><th>Description</th></tr></thead>
<tbody>
<tr><td><strong>Fill</strong></td><td>The interior color/texture of the shape. Can be None, Solid Color, Gradient (linear/radial/sweep), Media (image/video), or Intrinsic (determined by shape).</td></tr>
<tr><td><strong>Stroke</strong></td><td>An outline around the shape. Configure width, color, position (inside the edge, centered, or outside), line cap (butt/round/square), and line join (miter/round/bevel).</td></tr>
<tr><td><strong>Transform</strong></td><td>Move, scale, rotate, and skew the shape. Includes anchor point for rotation center.</td></tr>
<tr><td><strong>Blending</strong></td><td>Controls how the shape composits with layers below. Opacity slider + 28 blend modes.</td></tr>
<tr><td><strong>Border & Shadow</strong></td><td>Drop shadow and inner/outer border effects.</td></tr>
<tr><td><strong>Visual Effects</strong></td><td>Any effect can be applied to a shape layer (blur, color grade, distort, procedural generation, etc.).</td></tr>
</tbody>
</table>

## Capabilities

- Transform (position, scale, rotation, anchor point)
- Opacity control
- Fill — solid color, gradient, image, or video
- Stroke — width, color, position (inside/center/outside), cap, join
- Blending mode (28 modes)
- Border & shadow
- Visual effects stack
- On-canvas handles for direct manipulation
- Renderable — visible in preview and export

## See Also

- [Getting Started Guide](/guide) — covers transform, fill, stroke, and blending in detail
- [Element Types Overview](/elements/) — capability matrix and comparison of all layer types
- [Shape Templates](/shapes/) — 20 built-in parametric shapes
- [Browse All Effects](/effects/) — every effect with parameters and thumbnails
