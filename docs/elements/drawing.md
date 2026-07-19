---
title: Drawing Element
description: "A freehand drawing or stroke layer created with the Drawing Tool. Supports variable-width strokes, taper, and all visual properties. Unlike Shape layers, Drawing layers use a path-based stroke model rather than a fill+stroke model."
---

# Drawing Element

> A freehand drawing or stroke layer created with the Drawing Tool. Supports variable-width strokes, taper, and all visual properties. Unlike Shape layers, Drawing layers use a path-based stroke model rather than a fill+stroke model.

## Properties

<table>
<thead><tr><th>Property</th><th>Description</th></tr></thead>
<tbody>
<tr><td><strong>Stroke</strong></td><td>The main visual of a drawing. Configure color, width, and taper (thinning at the start/end of the stroke).</td></tr>
<tr><td><strong>Fill</strong></td><td>Only applies to closed drawing paths.</td></tr>
<tr><td><strong>Transform</strong></td><td>Position, scale, rotation, and anchor point for the entire drawing.</td></tr>
<tr><td><strong>Blending</strong></td><td>Opacity and blend mode compositing.</td></tr>
<tr><td><strong>Visual Effects</strong></td><td>All effects are applicable (stroke-specific effects like Stroke Color, Stroke Taper, Roughen Edges are especially useful).</td></tr>
</tbody>
</table>

## Capabilities

- Transform (position, scale, rotation, anchor point)
- Opacity control
- Fill (for closed drawing paths)
- Stroke — width, color, taper (start/end width)
- Blending mode
- Border & shadow
- Visual effects stack
- On-canvas path editing handles
- Renderable

## See Also

- [Getting Started Guide](/guide) — covers transform, fill, stroke, and blending in detail
- [Element Types Overview](/elements/) — capability matrix and comparison of all layer types
- [Browse All Effects](/effects/) — every effect with parameters and thumbnails
