---
title: Nested Scene Element
description: "A nested scene layer embeds an entire Alight Motion project (scene) inside the current project. This allows for modular composition — complex animations can be built as separate scenes and then composed together. Nested scenes have transform, opacity, and visual effects."
---

# Nested Scene Element

> A nested scene layer embeds an entire Alight Motion project (scene) inside the current project. This allows for modular composition — complex animations can be built as separate scenes and then composed together. Nested scenes have transform, opacity, and visual effects.

## Properties

<table>
<thead><tr><th>Property</th><th>Description</th></tr></thead>
<tbody>
<tr><td><strong>Transform</strong></td><td>Position, scale, and rotation of the nested scene within the parent composition.</td></tr>
<tr><td><strong>Opacity</strong></td><td>Overall transparency of the nested scene.</td></tr>
<tr><td><strong>Nested Scene</strong></td><td>The embedded scene file (.amp file) that this layer references.</td></tr>
<tr><td><strong>Visual Effects</strong></td><td>Effects applied to the nested scene affect its entire content.</td></tr>
</tbody>
</table>

## Capabilities

- Transform (position, scale, rotation, anchor point)
- Opacity control
- Visual effects stack
- Nested scene reference

## Limitations

- No fill or stroke
- No blending mode
- No border or shadow

## See Also

- [Getting Started Guide](/guide) — covers transform, fill, stroke, and blending in detail
- [Element Types Overview](/elements/) — capability matrix and comparison of all layer types
- [Browse All Effects](/effects/) — every effect with parameters and thumbnails
