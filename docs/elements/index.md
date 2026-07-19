---
title: Element Types
description: Learn about every layer type in Alight Motion — Shape, Text, Camera, Null Object, Audio, Drawing, and Nested Scene.
---

# Element Types

Alight Motion has **7 layer types**, each with its own set of capabilities and properties.

## Capability Matrix

<table class="capability-matrix">
<thead><tr><th>Feature</th><th>Shape</th><th>Drawing</th><th>Text</th><th>Camera</th><th>Null Object</th><th>Audio</th><th>Nested Scene</th></tr></thead>
<tbody>
<tr><td><strong>Transform</strong></td><td class="cap-yes">✓</td><td class="cap-yes">✓</td><td class="cap-yes">✓</td><td class="cap-yes">✓</td><td class="cap-yes">✓</td><td class="cap-no">—</td><td class="cap-yes">✓</td></tr>
<tr><td><strong>Opacity</strong></td><td class="cap-yes">✓</td><td class="cap-yes">✓</td><td class="cap-yes">✓</td><td class="cap-no">—</td><td class="cap-no">—</td><td class="cap-no">—</td><td class="cap-yes">✓</td></tr>
<tr><td><strong>Fill</strong></td><td class="cap-yes">✓</td><td class="cap-yes">✓</td><td class="cap-yes">✓</td><td class="cap-no">—</td><td class="cap-no">—</td><td class="cap-no">—</td><td class="cap-no">—</td></tr>
<tr><td><strong>Stroke</strong></td><td class="cap-yes">✓</td><td class="cap-yes">✓</td><td class="cap-yes">✓</td><td class="cap-no">—</td><td class="cap-no">—</td><td class="cap-no">—</td><td class="cap-no">—</td></tr>
<tr><td><strong>Blending</strong></td><td class="cap-yes">✓</td><td class="cap-yes">✓</td><td class="cap-yes">✓</td><td class="cap-no">—</td><td class="cap-no">—</td><td class="cap-no">—</td><td class="cap-no">—</td></tr>
<tr><td><strong>Border & Shadow</strong></td><td class="cap-yes">✓</td><td class="cap-yes">✓</td><td class="cap-yes">✓</td><td class="cap-no">—</td><td class="cap-no">—</td><td class="cap-no">—</td><td class="cap-no">—</td></tr>
<tr><td><strong>Visual Effects</strong></td><td class="cap-yes">✓</td><td class="cap-yes">✓</td><td class="cap-yes">✓</td><td class="cap-yes">✓</td><td class="cap-yes">✓</td><td class="cap-no">—</td><td class="cap-yes">✓</td></tr>
<tr><td><strong>Renderable</strong></td><td class="cap-yes">✓</td><td class="cap-yes">✓</td><td class="cap-yes">✓</td><td class="cap-no">—</td><td class="cap-no">—</td><td class="cap-no">—</td><td class="cap-yes">✓</td></tr>
<tr><td><strong>Gain Animation</strong></td><td class="cap-no">—</td><td class="cap-no">—</td><td class="cap-yes">✓</td><td class="cap-no">—</td><td class="cap-no">—</td><td class="cap-yes">✓</td><td class="cap-no">—</td></tr>
<tr><td><strong>Source Media</strong></td><td class="cap-no">—</td><td class="cap-no">—</td><td class="cap-no">—</td><td class="cap-no">—</td><td class="cap-no">—</td><td class="cap-yes">✓</td><td class="cap-no">—</td></tr>
<tr><td><strong>Nested Scene</strong></td><td class="cap-no">—</td><td class="cap-no">—</td><td class="cap-no">—</td><td class="cap-no">—</td><td class="cap-no">—</td><td class="cap-no">—</td><td class="cap-yes">✓</td></tr>
</tbody>
</table>

---

## <span class="element-icon"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#6d28d9" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/></svg></span> Shape {#shape}

> The most common layer type. Shapes can be rectangles, ellipses, polygons, stars, arcs, or any of the 20 built-in shape templates. Every shape has a fill (solid color, gradient, or media) and optional stroke. Shapes are fully renderable and support all visual properties.

### Properties

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

**Capabilities:**
- Transform (position, scale, rotation, anchor point)
- Opacity control
- Fill — solid color, gradient, image, or video
- Stroke — width, color, position (inside/center/outside), cap, join
- Blending mode (28 modes)
- Border & shadow
- Visual effects stack
- On-canvas handles for direct manipulation
- Renderable — visible in preview and export

---

## <span class="element-icon"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#6d28d9" stroke-width="2"><path d="M3 17 Q7 5 12 12 Q16 18 21 6"/></svg></span> Drawing {#drawing}

> A freehand drawing or stroke layer created with the Drawing Tool. Supports variable-width strokes, taper, and all visual properties. Unlike Shape layers, Drawing layers use a path-based stroke model rather than a fill+stroke model.

### Properties

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

**Capabilities:**
- Transform (position, scale, rotation, anchor point)
- Opacity control
- Fill (for closed drawing paths)
- Stroke — width, color, taper (start/end width)
- Blending mode
- Border & shadow
- Visual effects stack
- On-canvas path editing handles
- Renderable

---

## <span class="element-icon"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#6d28d9" stroke-width="2"><text x="12" y="20" text-anchor="middle" font-size="20" fill="#6d28d9" stroke="none">A</text></svg></span> Text {#text}

> A text layer displays a string of text with full typographic control. Supports multiple fonts, text styling (bold/italic/underline), alignment, tracking, leading, and paragraph settings. Text layers can have a Gain effect for color/opacity animation.

### Properties

<table>
<thead><tr><th>Property</th><th>Description</th></tr></thead>
<tbody>
<tr><td><strong>Text Content</strong></td><td>The string of text to display. Includes font family, font size, bold/italic/underline styling.</td></tr>
<tr><td><strong>Text Alignment</strong></td><td>Horizontal alignment (left/center/right) and vertical alignment.</td></tr>
<tr><td><strong>Tracking & Leading</strong></td><td>Character spacing (tracking) and line spacing (leading).</td></tr>
<tr><td><strong>Fill</strong></td><td>Color or gradient applied to the text characters.</td></tr>
<tr><td><strong>Stroke</strong></td><td>Outline around each character, with configurable width and position.</td></tr>
<tr><td><strong>Transform</strong></td><td>Position, scale, rotation for the entire text block.</td></tr>
<tr><td><strong>Gain</strong></td><td>Per-character animation of opacity and color — keyframable for reveal effects.</td></tr>
<tr><td><strong>Visual Effects</strong></td><td>All effects apply, plus text-specific effects (Count Up/Down, Text Progress, Text Randomizer, Text Spacing, Text Transform, Timecode).</td></tr>
</tbody>
</table>

**Capabilities:**
- Transform (position, scale, rotation, anchor point)
- Opacity control
- Fill — solid color, gradient, image, or video
- Stroke — width, color, position, cap, join
- Blending mode
- Border & shadow
- Visual effects stack
- Text-specific properties (font, size, alignment, tracking, leading, etc.)
- Gain animation (per-character color & opacity)
- Renderable

---

## <span class="element-icon"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#6d28d9" stroke-width="2"><path d="M23 7a1 1 0 0 0-1-1h-3.5l-2-3h-7l-2 3H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h20a1 1 0 0 0 1-1z"/><circle cx="12" cy="13" r="4"/></svg></span> Camera {#camera}

> A camera layer provides a movable viewpoint into the 3D scene. It has a Field of View (FOV) setting and can be either Perspective or Orthographic. Camera layers have transform and visual effects but no fill, stroke, opacity, or blending — they are not renderable objects themselves.

### Properties

<table>
<thead><tr><th>Property</th><th>Description</th></tr></thead>
<tbody>
<tr><td><strong>Transform</strong></td><td>Position and rotation of the camera in 3D space. Z-position controls zoom/distance.</td></tr>
<tr><td><strong>Field of View (FOV)</strong></td><td>The camera's angular Field of View, controlling how much of the scene is visible. Higher values = wider view (fish-eye effect).</td></tr>
<tr><td><strong>Camera Type</strong></td><td>Perspective (objects farther away appear smaller, realistic 3D) or Orthographic (no perspective distortion, objects stay same size regardless of distance).</td></tr>
<tr><td><strong>Visual Effects</strong></td><td>Some effects can be applied to camera layers, affecting the rendered view.</td></tr>
</tbody>
</table>

**Capabilities:**
- Transform (position, scale, rotation, anchor point)
- Visual effects stack
- Field of View (FOV) adjustment
- Perspective / Orthographic camera type

**Limitations:**
- No fill or stroke
- No opacity control (camera is always fully transparent)
- No blending mode
- No border or shadow
- Not directly renderable — affects how other layers are viewed

---

## <span class="element-icon"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#6d28d9" stroke-width="2" stroke-dasharray="2 2"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="12" y1="3" x2="12" y2="21"/></svg></span> Null Object {#null-object}

> A null object is an invisible layer used as a parenting reference. It has transform properties and can have visual effects, but is not rendered in the final output. Null objects are essential for rigging complex animations — you parent other layers to a null to control them as a group.

### Properties

<table>
<thead><tr><th>Property</th><th>Description</th></tr></thead>
<tbody>
<tr><td><strong>Transform</strong></td><td>Position, scale, and rotation. When other layers are parented to a null, they inherit and add to the null's transform.</td></tr>
<tr><td><strong>Visual Effects</strong></td><td>Effects on a null object affect the transform/rendering of its child layers.</td></tr>
</tbody>
</table>

**Capabilities:**
- Transform (position, scale, rotation, anchor point)
- Visual effects stack

**Limitations:**
- No fill or stroke
- No opacity control
- No blending mode
- No border or shadow
- Not renderable — invisible in preview and export

---

## <span class="element-icon"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#6d28d9" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M18.5 6.5a10 10 0 0 1 0 11M15.5 9.5a5 5 0 0 1 0 5"/></svg></span> Audio {#audio}

> An audio layer plays back a sound file. It has volume and gain controls but no visual properties — it cannot have fill, stroke, transform, blending, or visual effects. Audio layers are purely sonic.

### Properties

<table>
<thead><tr><th>Property</th><th>Description</th></tr></thead>
<tbody>
<tr><td><strong>Source Media</strong></td><td>The audio file (MP3, WAV, M4A, etc.) imported into the project.</td></tr>
<tr><td><strong>Volume</strong></td><td>Overall loudness of the audio layer.</td></tr>
<tr><td><strong>Gain</strong></td><td>Per-keyframe volume animation for fades and ducking.</td></tr>
</tbody>
</table>

**Capabilities:**
- Source media playback
- Volume control
- Gain animation

**Limitations:**
- No transform, fill, or stroke
- No visual content — not renderable
- No blending mode
- No border or shadow
- No visual effects

---

## <span class="element-icon"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#6d28d9" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="3"/><rect x="6" y="6" width="12" height="12" rx="2" stroke-opacity="0.5"/></svg></span> Nested Scene {#nested-scene}

> A nested scene layer embeds an entire Alight Motion project (scene) inside the current project. This allows for modular composition — complex animations can be built as separate scenes and then composed together. Nested scenes have transform, opacity, and visual effects.

### Properties

<table>
<thead><tr><th>Property</th><th>Description</th></tr></thead>
<tbody>
<tr><td><strong>Transform</strong></td><td>Position, scale, and rotation of the nested scene within the parent composition.</td></tr>
<tr><td><strong>Opacity</strong></td><td>Overall transparency of the nested scene.</td></tr>
<tr><td><strong>Nested Scene</strong></td><td>The embedded scene file (.amp file) that this layer references.</td></tr>
<tr><td><strong>Visual Effects</strong></td><td>Effects applied to the nested scene affect its entire content.</td></tr>
</tbody>
</table>

**Capabilities:**
- Transform (position, scale, rotation, anchor point)
- Opacity control
- Visual effects stack
- Nested scene reference

**Limitations:**
- No fill or stroke
- No blending mode
- No border or shadow

---
