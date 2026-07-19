---
title: Null Object Element
description: "A null object is an invisible layer used as a parenting reference. It has transform properties and can have visual effects, but is not rendered in the final output. Null objects are essential for rigging complex animations — you parent other layers to a null to control them as a group."
---

# Null Object Element

> A null object is an invisible layer used as a parenting reference. It has transform properties and can have visual effects, but is not rendered in the final output. Null objects are essential for rigging complex animations — you parent other layers to a null to control them as a group.

## Properties

<table>
<thead><tr><th>Property</th><th>Description</th></tr></thead>
<tbody>
<tr><td><strong>Transform</strong></td><td>Position, scale, and rotation. When other layers are parented to a null, they inherit and add to the null's transform.</td></tr>
<tr><td><strong>Visual Effects</strong></td><td>Effects on a null object affect the transform/rendering of its child layers.</td></tr>
</tbody>
</table>

## Capabilities

- Transform (position, scale, rotation, anchor point)
- Visual effects stack

## Limitations

- No fill or stroke
- No opacity control
- No blending mode
- No border or shadow
- Not renderable — invisible in preview and export

## See Also

- [Getting Started Guide](/guide) — covers transform, fill, stroke, and blending in detail
- [Element Types Overview](/elements/) — capability matrix and comparison of all layer types
- [Browse All Effects](/effects/) — every effect with parameters and thumbnails
