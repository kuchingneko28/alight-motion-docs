---
title: Camera Element
description: "A camera layer provides a movable viewpoint into the 3D scene. It has a Field of View (FOV) setting and can be either Perspective or Orthographic. Camera layers have transform and visual effects but no fill, stroke, opacity, or blending — they are not renderable objects themselves."
---

# Camera Element

> A camera layer provides a movable viewpoint into the 3D scene. It has a Field of View (FOV) setting and can be either Perspective or Orthographic. Camera layers have transform and visual effects but no fill, stroke, opacity, or blending — they are not renderable objects themselves.

## Properties

<table>
<thead><tr><th>Property</th><th>Description</th></tr></thead>
<tbody>
<tr><td><strong>Transform</strong></td><td>Position and rotation of the camera in 3D space. Z-position controls zoom/distance.</td></tr>
<tr><td><strong>Field of View (FOV)</strong></td><td>The camera's angular视野, controlling how much of the scene is visible. Higher values = wider view (fish-eye effect).</td></tr>
<tr><td><strong>Camera Type</strong></td><td>Perspective (objects farther away appear smaller, realistic 3D) or Orthographic (no perspective distortion, objects stay same size regardless of distance).</td></tr>
<tr><td><strong>Visual Effects</strong></td><td>Some effects can be applied to camera layers, affecting the rendered view.</td></tr>
</tbody>
</table>

## Capabilities

- Transform (position, scale, rotation, anchor point)
- Visual effects stack
- Field of View (FOV) adjustment
- Perspective / Orthographic camera type

## Limitations

- No fill or stroke
- No opacity control (camera is always fully transparent)
- No blending mode
- No border or shadow
- Not directly renderable — affects how other layers are viewed

## See Also

- [Getting Started Guide](/guide) — covers transform, fill, stroke, and blending in detail
- [Element Types Overview](/elements/) — capability matrix and comparison of all layer types
- [3D Effects](/effects/?category=3d) — Box, Cylinder, Page Curl, and other 3D effects
- [Browse All Effects](/effects/) — every effect with parameters and thumbnails
