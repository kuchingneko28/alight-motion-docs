---
title: How to Use Effects
description: A plain-English guide to using effects in Alight Motion — adding, adjusting, and animating effects on your layers.
---

# How to Use Effects

This guide explains how effects work in Alight Motion and how to read the parameter tables in this documentation.

::: info
This documentation is reverse-engineered from the Alight Motion APK. It is not affiliated with Alight Creative.
:::

## What Are Effects?

Effects are visual filters and transformations you can apply to any layer in your project. They can:

- Change how a layer looks (blur, color grade, distort)
- Control transparency and masking (chroma key, luma key)
- Add motion or animation (shake, oscillate, motion blur)
- Generate visuals from scratch (noise, clouds, starfield)
- Work with text or shape layers specifically (text spacing, stroke taper)

## How to Add an Effect

1. **Select a layer** in your timeline.
2. Tap the **effects icon** (star/wand icon) in the layer properties panel.
3. Browse by category or use search to find an effect.
4. Tap the effect to apply it.

You can stack multiple effects on a single layer — they are applied top to bottom.

## Understanding the Parameter Table

Each effect page includes a **Parameters** table. Here's what each column means:

| Column | What it means |
|--------|--------------|
| **Parameter** | The control name as shown in the app |
| **Type** | What kind of control it is (see below) |
| **Default** | The value when you first add the effect |
| **Min / Max** | The allowed range of values |
| **Step / Snap** | How much the value changes per tick, or natural snap points |

A **—** means the app doesn't publish that value — it handles it internally.

## Control Types Explained

| Type | How to use it |
|------|--------------|
| **Number** | Tap and drag up/down to increase/decrease |
| **Angle (°)** | Drag to set degrees |
| **Percentage** | Value shown as a percentage (0–100%) |
| **Relative %** | Offset percentage — can be negative (e.g. −50% to +50%) |
| **Frequency (Hz)** | How fast something cycles per second |
| **Duration (s)** | Time in seconds |
| **Temperature (K)** | Color temperature in Kelvin (e.g. 6500 K = daylight white) |
| **Speed (RPM)** | Rotations per minute |
| **Integer** | Whole numbers only, controlled with a slider |
| **Slider** | Drag a horizontal bar |
| **Toggle** | Tap to flip On / Off |
| **Color** | Tap to open the color picker — set hue, saturation, brightness, and opacity |
| **Dropdown** | Tap to choose from a list of options |
| **Point (X, Y)** | Drag a handle on the canvas, or enter X/Y values manually |
| **XYZ** | Three linked numbers controlling a 3D position |
| **XYZ Rotation** | Three linked angles for 3D rotation |
| **Hue Disc** | A circular color wheel — drag to set hue, adjust rings for saturation and lightness |
| **Orientation** | A 3D rotation handle (stored as a quaternion internally) |

## Members Only

Effects marked with <Badge type="warning" text="🔒 Members Only" /> require an **Alight Motion subscription**. You can see them in the effects list, but you need a paid account to apply or export them.

## Layer Compatibility

Some effects only work on specific layer types. If an effect doesn't appear in your effects panel, it likely has a restriction:

| Restriction | What it means |
|------------|--------------|
| **Media layers** | Only works on video/image layers |
| **Text layers** | Only works on text layers (e.g. Text Spacing, Timecode) |
| **Stroke layers** | Only works on stroke/drawing layers |
| **Freehand layers** | Only works on freehand drawing layers |
| **Animation layers** | Only works on layers with keyframe animation |
| **Transform animation** | Only works when the layer has Move & Transform animation (e.g. Motion Blur) |

## Experimental Effects

Effects marked as **Experimental** are included in the app but are still being developed. They may have glitches, change between app versions, or be removed. Use with caution in final projects.

## Animating Effect Parameters

Most parameters can be **keyframed** — meaning their value changes over time.

1. Move your playhead to the start time.
2. Tap the **keyframe button** (diamond icon) next to the parameter.
3. Set the starting value.
4. Move to a different time, tap again, and set a new value.
5. Alight Motion smoothly interpolates between keyframes.

## Tips

- **Stack effects** — many great looks combine 2–3 effects (e.g. Color Tune + Soft Glow + Noise).
- **Animate Strength to 0** — keyframe Strength/Amount to 0 at the start and end to make an effect appear and disappear.
- **Seed randomizes patterns** — effects with a `Seed` parameter generate different noise/patterns at each seed value.
- **Evolution for looping** — keyframe `Evolution` to create seamlessly looping noise-based effects.
- **Copy Background** — composites pixels from behind the layer into the current one, useful for background blur effects.
