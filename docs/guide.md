---
title: Getting Started Guide
description: Alight Motion reference — layer types, common properties, effects, shapes, blend modes, and keyframes.
---

# Getting Started Guide

Reference for Alight Motion's core concepts — layers, properties, effects, shapes, blend modes, and animation.

- [Layer Types & Elements](#layer-types-elements) — Shape, Text, Camera, and more
- [Common Properties](#common-properties) — Transform, Fill, Stroke, Blending
- [Effects Reference](#effects-reference) — parameters, control types, compatibility
- [Shape Templates](#shape-templates) — 20 built-in parametric shapes
- [Transition Presets](#transition-presets) — 25 pre-animated in/out transitions
- [Blend Modes](#blend-modes) — 24 modes with GLSL shader details
- [Animation & Keyframes](#animation-keyframes)
- [Tips & Tricks](#tips-tricks)

---

## Layer Types & Elements

Everything in Alight Motion lives on a **layer**. There are **7 layer types**, each with its own capabilities:

| Type | Description | Docs |
|------|-------------|------|
| **Shape** | Rectangles, ellipses, polygons, stars — or any of 20 templates. Full fill + stroke + effects. | [→ Shape](/elements/shape) |
| **Drawing** | Freehand strokes from the Drawing Tool. Path-based with variable width and taper. | [→ Drawing](/elements/drawing) |
| **Text** | Typography with fonts, styling, alignment, tracking, and per-character Gain animation. | [→ Text](/elements/text) |
| **Camera** | A movable 3D viewpoint with FOV control (Perspective or Orthographic). Not renderable. | [→ Camera](/elements/camera) |
| **Null Object** | Invisible parenting reference. Parent layers to a null to animate them as a group. | [→ Null Object](/elements/null-object) |
| **Audio** | Plays sound files. Has volume and gain controls only — no visual properties. | [→ Audio](/elements/audio) |
| **Nested Scene** | Embeds an entire project inside the current one. Modular composition. | [→ Nested Scene](/elements/nested-scene) |

The [Element Types](/elements/) page has a **capability matrix** showing at a glance which features work on each layer.

---

## Common Properties

Most layer types share common properties. Understanding these helps when reading any effect page.

### Transform

All visual layers (Shape, Drawing, Text, Camera, Null, Nested Scene) have transform controls:

- **Position (X, Y)** — Move the layer on screen
- **Scale** — Uniform or non-uniform scaling
- **Rotation** — Rotate around the anchor point
- **Anchor Point** — Center of rotation and scaling (defaults to layer center)
- **Skew** — Tilt the layer along X or Y axis

### Fill

Fill determines how the interior of a layer is colored. Available on Shape, Drawing (closed paths), and Text. Fill types include:

- **None** — No fill, transparent interior
- **Solid Color** — Single flat color with opacity
- **Gradient** — Linear, Radial, or Sweep (conical) gradient
- **Media** — An image or video fills the shape
- **Intrinsic** — Shape-defined fill (used by some templates)

### Stroke

Stroke is an outline around the layer's shape. Available on Shape, Drawing, and Text:

- **Width** — Thickness of the outline
- **Color** — Stroke color
- **Position** — Inside edge, Center of edge, or Outside edge
- **Line Cap** — Butt, Round, or Square ends
- **Line Join** — Miter, Round, or Bevel corners

### Blending

Blending controls how a layer composites with the layers below it:

- **Opacity** — Overall transparency (0–100%)
- **Blend Mode** — Choose from 24 blend modes (see [Blend Modes](#blend-modes))

### Border & Shadow

Available on Shape, Drawing, and Text layers:

- **Drop Shadow** — Shadow offset behind the layer, with blur, color, and opacity
- **Inner/Outer Border** — Decorative borders inside or outside the layer edges

---

## Effects Reference

Effects are visual filters and transformations applied to layers. They can change appearance (blur, color grade, distort), control transparency (chroma key, luma key), add motion (shake, oscillate), generate visuals (noise, clouds, starfield), or work with specific layer types. Multiple effects stack on a single layer — applied top to bottom.

### Parameter Table

Each effect page includes a **Parameters** table:

| Column | Meaning |
|--------|---------|
| **Parameter** | The control name as shown in the app |
| **Type** | What kind of control it is |
| **Default** | Value when first added |
| **Min / Max** | Allowed range |
| **Step / Snap** | Value change per tick, or snap points |

A **—** means the app doesn't publish that value.

### Control Types

| Type | Description |
|------|-------------|
| **Number** | Tap and drag up/down to adjust |
| **Angle (°)** | Degrees of rotation |
| **Percentage** | Value shown as 0–100% |
| **Relative %** | Offset percentage, can be negative (−50% to +50%) |
| **Frequency (Hz)** | Cycles per second |
| **Duration (s)** | Time in seconds |
| **Temperature (K)** | Color temperature in Kelvin |
| **Speed (RPM)** | Rotations per minute |
| **Slider** | Horizontal bar drag |
| **Toggle** | On / Off |
| **Color** | Opens color picker |
| **Dropdown** | Pick from a list |
| **Point (X, Y)** | Canvas handle or X/Y input |
| **XYZ** | Three linked numbers for 3D position |
| **XYZ Rotation** | Three linked angles for 3D rotation |
| **Hue Disc** | Color wheel with saturation/lightness rings |
| **Orientation** | 3D rotation handle (quaternion) |

### Members Only

Effects marked with <Badge type="warning" text="🔒 Members Only" /> require an **Alight Motion subscription**. Visible in the list but require a paid account to apply or export.

### Layer Compatibility

Some effects only work on specific layer types:

| Restriction | Scope |
|-------------|-------|
| **Media layers** | Video/image layers only |
| **Text layers** | Text layers only |
| **Stroke layers** | Stroke/drawing layers only |
| **Freehand layers** | Freehand drawing layers only |
| **Animation layers** | Keyframe-animated layers only |
| **Transform animation** | Move & Transform animated layers only |

### Experimental Effects

Effects marked **Experimental** are still in development. May have glitches, change between versions, or be removed.

---

## Shape Templates

Alight Motion includes **20 built-in shape templates** — parametric shapes with adjustable parameters and on-canvas handles for direct editing.

[→ Browse all shape templates](/shapes/)

| Shape | Description |
|-------|-------------|
| [Arc](/shapes/arc) | Curved line with adjustable start/end angle and radius |
| [Arrow](/shapes/arrow) | Line with arrowhead — adjustable tail, head width, and length |
| [Callout](/shapes/calloutrr) | Rounded speech bubble with pointer tail |
| [Circle](/shapes/circle) | Perfect ellipse (adjustable width and height) |
| [Line](/shapes/line) | Straight line between two points |
| [Moon](/shapes/moon) | Crescent moon shape |
| [Multifoil](/shapes/multifoil) | Multi-lobed flower / clover shape |
| [Pentagram](/shapes/penta) | Star polygon (pentagram) |
| [Pie](/shapes/pie) | Wedge / pizza slice shape |
| [Plus](/shapes/plus) | Cross / plus sign |
| [Polygon](/shapes/poly) | Regular polygon with configurable sides |
| [Quad](/shapes/quad) | Quadrilateral with 4 adjustable corners |
| [Rectangle](/shapes/rect) | Simple rectangle |
| [Rounded Rect](/shapes/roundrect) | Rectangle with corner radius control |
| [Stamp](/shapes/stamp) | Multi-lobe stamp with indentation |
| [Star](/shapes/star) | Star with adjustable points and inner/outer radius |
| [Teardrop](/shapes/teardrop) | Teardrop / droplet |
| [Triangle](/shapes/triangle) | Equilateral triangle |
| [Wide Line](/shapes/wideline) | Thick rectangular bar |

---

## Transition Presets

Alight Motion includes **25 pre-configured transition presets** — effect setups that animate layers on or off screen. Available in the Effects → Presets panel.

[→ Browse all transition presets](/transitions/)

| Category | Count | Examples |
|----------|-------|---------|
| **Transition In** | 13 | Wipe, Spin, Dark, Blue Lightning, Horizontal Split, Tumble |
| **Transition Out** | 12 | 5-Way Wipe, Clock Wipe, Grid Wipe, Hex Wipe, Split Wipe |

Transition presets use existing effects (Dissolve, Wipe, Lightning, etc.) with pre-animated keyframes. Adjust timing in the effect timeline after applying.

---

## Blend Modes

Blend modes control how a layer's colors interact with the layers below it. **24 blend modes** grouped into categories. Each mode page shows the **GLSL fragment shader** implementing the blend.

[→ Browse all blend modes](/blend-modes/)

| Category | Modes | Effect |
|----------|-------|--------|
| **Darken** | Color Burn, Darken, Darker Color, Linear Burn, Subtract | Result darker — white has no effect |
| **Lighten** | Color Dodge, Divide, Lighten, Lighter Color, Linear Dodge | Result lighter — black has no effect |
| **Contrast** | Hard Light, Linear Light, Overlay, Pin Light, Soft Light, Soft Overlay, Vivid Light | Contrast depends on top layer brightness |
| **Difference** | Difference, Exclusion | Remove common tones — black does nothing, white inverts |
| **Color** | Color Multiply, Color, Hue, Luminance, Saturation | Use one component (hue/saturation/luminance) from top layer |

### Quick Reference

- Blend modes work with opacity — reduce opacity for subtle blends
- **Overlay** — common contrast blend, good for textures
- **Linear Dodge, Color Dodge** — bright glowing effects (screen-style)
- **Linear Burn, Color Burn** — dark rich composites (multiply-style)
- **Difference** — useful for alignment (identical layers produce black)

---

## Animation & Keyframes

Most parameters can be **keyframed** — values change over time. Keyframes interpolate between values with configurable easing.

### Easing

- **Linear** — constant speed
- **Ease In / Ease Out** — gradual acceleration or deceleration
- **Custom** — manual curve adjustment

### Tips

- **Copy/Paste** — long-press a keyframed property to copy animation curves
- **Looping** — keyframe `Evolution` on noise-based effects for seamless loops
- **Parenting** — parent layers to a [Null Object](/elements/null-object) to animate groups

---

## Tips & Tricks

- **Stack effects** — combine 2–3 effects for complex looks (e.g. Color Tune + Soft Glow + Noise)
- **Animate Strength to 0** — keyframe Strength/Amount from 0 → 100 → 0 for effects that appear and disappear
- **Seed randomizes patterns** — effects with a `Seed` parameter generate different noise/patterns per seed value
- **Copy Background** — composites pixels from behind the layer into the current one, useful for background blur
- **Use Nulls for rigging** — build complex hierarchies by parenting layers to nested Null Objects
- **Search** — press `Ctrl/Cmd + K` or tap the search icon to find any effect, element, or blend mode instantly
