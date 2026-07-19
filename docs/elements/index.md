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

**Element by Element**

### <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#6d28d9" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/></svg> [Shape](/elements/shape)

The most common layer type. Shapes can be rectangles, ellipses, polygons, stars, arcs, or any of the 20 built-in shape templates. Every shape has a fill (solid color, gradient, or media) and optional stroke. Shapes are fully renderable and support all visual properties.

**Capabilities:** 9 · **Limitations:** 0

→ [View Shape details](/elements/shape)

### <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#6d28d9" stroke-width="2"><path d="M3 17 Q7 5 12 12 Q16 18 21 6"/></svg> [Drawing](/elements/drawing)

A freehand drawing or stroke layer created with the Drawing Tool. Supports variable-width strokes, taper, and all visual properties. Unlike Shape layers, Drawing layers use a path-based stroke model rather than a fill+stroke model.

**Capabilities:** 9 · **Limitations:** 0

→ [View Drawing details](/elements/drawing)

### <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#6d28d9" stroke-width="2"><text x="12" y="20" text-anchor="middle" font-size="20" fill="#6d28d9" stroke="none">A</text></svg> [Text](/elements/text)

A text layer displays a string of text with full typographic control. Supports multiple fonts, text styling (bold/italic/underline), alignment, tracking, leading, and paragraph settings. Text layers can have a Gain effect for color/opacity animation.

**Capabilities:** 10 · **Limitations:** 0

→ [View Text details](/elements/text)

### <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#6d28d9" stroke-width="2"><path d="M23 7a1 1 0 0 0-1-1h-3.5l-2-3h-7l-2 3H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h20a1 1 0 0 0 1-1z"/><circle cx="12" cy="13" r="4"/></svg> [Camera](/elements/camera)

A camera layer provides a movable viewpoint into the 3D scene. It has a Field of View (FOV) setting and can be either Perspective or Orthographic. Camera layers have transform and visual effects but no fill, stroke, opacity, or blending — they are not renderable objects themselves.

**Capabilities:** 4 · **Limitations:** 5

→ [View Camera details](/elements/camera)

### <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#6d28d9" stroke-width="2" stroke-dasharray="2 2"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="12" y1="3" x2="12" y2="21"/></svg> [Null Object](/elements/null-object)

A null object is an invisible layer used as a parenting reference. It has transform properties and can have visual effects, but is not rendered in the final output. Null objects are essential for rigging complex animations — you parent other layers to a null to control them as a group.

**Capabilities:** 2 · **Limitations:** 5

→ [View Null Object details](/elements/null-object)

### <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#6d28d9" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M18.5 6.5a10 10 0 0 1 0 11M15.5 9.5a5 5 0 0 1 0 5"/></svg> [Audio](/elements/audio)

An audio layer plays back a sound file. It has volume and gain controls but no visual properties — it cannot have fill, stroke, transform, blending, or visual effects. Audio layers are purely sonic.

**Capabilities:** 3 · **Limitations:** 5

→ [View Audio details](/elements/audio)

### <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#6d28d9" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="3"/><rect x="6" y="6" width="12" height="12" rx="2" stroke-opacity="0.5"/></svg> [Nested Scene](/elements/nested-scene)

A nested scene layer embeds an entire Alight Motion project (scene) inside the current project. This allows for modular composition — complex animations can be built as separate scenes and then composed together. Nested scenes have transform, opacity, and visual effects.

**Capabilities:** 4 · **Limitations:** 3

→ [View Nested Scene details](/elements/nested-scene)
