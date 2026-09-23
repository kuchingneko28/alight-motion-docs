# Project & Preset Format

Alight Motion projects and presets are plain XML scene files. This page documents the
format, defaults, and generation rules discovered by reverse-engineering the app
(v5.0.273) so that a tool or LLM can generate a valid project that adds elements and
effects.

::: tip Scope
A **preset** is the same document as a **project**, only with `type="preset"`
(and a different format version). Everything below applies to both.
:::

## Format versions

| Constant | Value | Meaning |
| --- | --- | --- |
| `PROJECT_FORMAT_VERSION` | `106` | Base scene format |
| `PRESET_FORMAT_VERSION` | `107` | Preset flag |
| `TIME_REMAPPING_VERSION` | `108` | Speed-map / time remapping |

The version is emitted as `ffver`:

- `106` — a normal project.
- `107` — any preset (`type="preset"`).
- `108` — the scene (or a nested scene) contains a layer with a `speedMap` that has
  more than one keyframe.

When reading, `107` and `108` are both upgraded to `106` semantics. `amver` is a build
number, not the format version.

## Scene document

```xml
<scene title="New Project"
       width="1080" height="1080"
       exportWidth="1080" exportHeight="1080"
       bgcolor="#FFD8D8D8"
       totalTime="5000" fps="30"
       modifiedTime="1700000000000"
       amver="1028425" ffver="106"
       am="com.alightcreative.motion/5.0.273.1028425"
       amplatform="android">
  <!-- media*, bookmark*, then elements* in order -->
</scene>
```

### Attributes

| Attribute | Type | Default | Notes |
| --- | --- | --- | --- |
| `title` | string | `New Project` | Project name |
| `width`, `height` | int | — | Canvas size in px |
| `exportWidth`, `exportHeight` | int | = width/height | Export size |
| `bgcolor` | `#AARRGGBB` | Light Grey `#FFD8D8D8` | See background options |
| `totalTime` | int (ms) | — | Duration |
| `fps` | string | `30` | fps number, e.g. `30` or `29.97` |
| `modifiedTime` | long (ms) | — | Unix time |
| `amver` | int | `1028425` | App **version code** |
| `ffver` | int | `106` | Format version (see above) |
| `am` | string | `com.alightcreative.motion/5.0.273.1028425` | Package/version |
| `amplatform` | string | `android` | Platform |
| `type` | string | omitted | Lowercase scene type, only when not a normal scene (e.g. `preset`) |
| `templateLink` | string | omitted | Template id |
| `retime` | string | `off` | Retiming method, lowercase, `_` → `-` |
| `thumbnailTime` | int | omitted when `< 0` | Preview frame time |
| `retimeIn`, `retimeOut` | int | omitted when `0` | Retime in/out marks |
| `retimeAdaptFPS` | bool | `false` | FPS-adaptive retime |
| `precompose` | string | `dynamicResolution` | Precompose mode: `off`, `dynamicResolution`, or `fixedResolution` |

### Defaults for a new project

- **Frame rate:** `30` fps. The picker offers `12, 15, 18, 20, 24, 25, 30, 48, 50, 60`
  (rates ≥ 35 fps are only offered below the device's max resolution).
- **Background:** `Light Grey`. Options are `Black`, `White`, `Light Grey`, `Green`,
  `Blue`, `Transparent` (encoded as `#AARRGGBB`).
- **Name:** the base name is `New Project` (or `New Element`). The app picks the first
  unused candidate: `New Project`, `New Project 1`, `New Project 2`, …

### Defaults by element type

When the app creates a layer it starts from these values:

| Element | Defaults |
| --- | --- |
| Transform (all visual layers) | `location` `0,0,0`, `pivot` `0,0`, `scale` `1,1`, `skew` `0,0`, `rotation` `0`, `opacity` `1` |
| Shape | white fill; template parameter defaults from `assets/shapes/<slug>.xml` |
| Text | `size` 18, `wrapWidth` 512, `align` left, white fill |
| Drawing | no strokes until drawn |
| Camera | `type` `perspective`, `fov` 60, `focusDistance` 500, `focusDepthOfField` 100, `focusBlurStrength` 0.5, fog off (`fogColor` white, `fogNearZ` 0, `fogFarZ` 500); placed at the scene center |
| Audio | `gain` 1, `loop` false |
| Null object | transform only |
| Nested scene | `precompose` `dynamicResolution` |

Timing defaults are `startTime` `0` and `endTime` equal to the scene's `totalTime`.

## ID allocation

Every element needs a unique positive integer `id`. When the app adds an element it
calls the equivalent of:

```
nextId = max(lastUsedId, max(element.id in scene)) + 1
```

- IDs are allocated globally per scene, monotonically increasing, and never reused
  within a session.
- The counter also remembers ids from other scenes, so generated ids may start well
  above the number of elements.
- `id` is serialized as a plain integer, e.g. `id="1"`.
- Parent/child links use `parent="<id>"`.

## Layer names

New layers use `makeNumberedLabel(base)`, which returns the first unused
`"<base> <n>"` starting at `n = 1` (so `Rectangle 1`, `Rectangle 2`, …).

Base names per element type:

| Element | Base name |
| --- | --- |
| Shape (live) | Localized shape name — `Rectangle`, `Circle`, `Star`, `Polygon`, `Rounded Rectangle`, `Triangle`, `Plus`, `Multifoil`, `Pie`, `Arc`, `Arrow`, `Wide Line`, `Quad`, `Irregular Pentagon`, `Callout`, … |
| Shape (imported) | `Shape` |
| Text | `Text` |
| Drawing | `Drawing` |
| Camera | `Camera` |
| Audio | `Audio` |
| Null object | `Null` |
| Group | `Group` |
| Nested scene | scene title |

Labels may carry tooling metadata suffixes such as `; t:start`, `; t:end`,
`; t:split`, or `; c:CODE`.

## Elements

Elements appear inside `<scene>` after media and bookmarks, in z-order (first = back).
The element tag depends on its type:

| Type | XML tag |
| --- | --- |
| Shape | `shape` |
| Text | `text` |
| Drawing | `drawing` |
| Nested scene | `embedScene` |
| Audio | `audio` |
| Camera | `camera` |
| Null object | `nullobj` |

### Common attributes (written in this order)

| Attribute | Type | Notes |
| --- | --- | --- |
| `id` | long | Always written |
| `tag` | string | Optional element tag |
| `label` | string | Omitted when blank |
| `hidden` | bool | Only when `true` |
| `startTime` | int (ms) | Required |
| `endTime` | int (ms) | Required |
| `clippingMask` | bool | Only when `true` |
| `fillType` | string | `color`, `media`, `intrinsic`, … when the type supports it |
| `blending` | string | Blend mode id; omitted when `normal` |
| `fillImage` | uri | Image fill |
| `src` | uri | Source media (audio/video) |
| `fillVideo` | uri | Video fill |
| `inTime`, `outTime` | int | Trim in/out (ms) |
| `loop` | bool | Only when `true` |
| `speed` | float | Only when a single speed value ≠ `1` |
| `mediaFillMode` | string | Always written |
| `parent` | long | Parent element id |
| `templatePPId`, `presetId` | string | Optional |

### Common child tags (written in this order)

1. `transform`
2. `fillColor`
3. `gradient`
4. `effect` (one per effect, in order)
5. `gain`
6. `speedMap` (when it has more than one keyframe)
7. `border` / `shadow` / `glow` / `path-stroke` edge decorations (freehand `stroke` for drawings)

### Drawing

A `<drawing>` element holds one or more freehand `<stroke>` children after the common
child tags:

```xml
<stroke color="#ff000000" width="4.000000" type="pen"
        points="0.000000,0.000000,1.000000;120.000000,80.000000,1.000000"/>
```

- `points` is `x,y,pressure` triples joined by `;`.
- `type` is the lowercased stroke-tool name; `color`/`width` set the stroke.

### Nested scenes

A nested scene is an `<embedScene>` element with an optional `link` (UUID) attribute,
followed by the common attributes/child tags and a complete `<scene>` document inline:

```xml
<embedScene id="4" label="Scene 1" startTime="0" endTime="5000" link="00000000-0000-0000-0000-000000000000">
  <transform>…</transform>
  <scene title="Scene 1" width="1080" height="1080" exportWidth="1080" exportHeight="1080"
         bgcolor="#00000000" totalTime="5000" fps="30" ffver="106" amver="1028425"
         am="com.alightcreative.motion/5.0.273.1028425" amplatform="android">
    <!-- nested elements -->
  </scene>
</embedScene>
```

### Retiming and speed

- A single speed other than `1` is written as the `speed` attribute, e.g. `speed="2"`.
- A keyframed speed uses a `<speedMap>` child (a normal keyable), written only when it
  has more than one keyframe. `ffver` becomes `108` whenever any `speedMap` does.

```xml
<shape id="2" label="Rectangle 1" startTime="0" endTime="5000" fillType="color" s=".rect">
  <transform>…</transform>
  <speedMap>
    <kf t="0.000000" v="0.500000"/>
    <kf t="2.000000" v="2.000000"/>
  </speedMap>
</shape>
```

## Transform

```xml
<transform orientation="0" size="1">
  <location value="540.000000,540.000000,0.000000"/>
  <pivot value="0.000000,0.000000"/>
  <scale value="1.000000,1.000000"/>
  <skew value="0.000000,0.000000"/>
  <rotation value="0.000000"/>
  <opacity value="1.000000"/>
</transform>
```

- Attributes `lockAspectRatio` (when `false`), `orientation` (when ≠ `0`), `size`
  (when ≠ `1`).
- Each child is a **keyable** value: written with a `value` attribute when static, or
  `<kf>` children when keyframed.
- Defaults: location `(0,0,0)`, pivot `(0,0)`, scale `(1,1)`, skew `(0,0)`,
  rotation `0`, opacity `1`.

## Shapes

A live shape references its template with `s=".<slug>"`, where `<slug>` is the tail of
the shape id `com.alightcreative.shapes.<slug>`:

```xml
<shape id="3" label="Rectangle 1" startTime="0" endTime="5000" fillType="color" s=".rect">
  <transform>…</transform>
  <fillColor value="#FFE3914C"/>
  <property name="size" type="vec2" value="360.000000,360.000000"/>
  <property name="cornerRadius" type="float" value="0.000000"/>
</shape>
```

- Shape parameters are `<property>` tags (see below). Available parameters depend on
  the shape — see [Shape Templates](/shapes/).
- A **non-live (imported)** shape has no `s` attribute; its outline lives in a
  `<parameter>` block instead of shape properties.

```xml
<shape id="7" label="Shape 1" startTime="0" endTime="5000" fillType="color">
  <transform>…</transform>
  <fillColor value="#FFFFFFFF"/>
  <parameter>
    <contour d="M0,0 L100,0 L100,100 Z"/>
  </parameter>
</shape>
```

A contour is either a static SVG path in `d`, or a keyed `<contour closed="true" exclude="false">`
containing one `<knot>` per point, each with `<in>`/`<p>`/`<out>` vectors.

## Gradient fills

A layer that exposes a gradient (e.g. `fillType="gradient"`) writes a `<gradient>` child
right after `fillColor`:

```xml
<gradient type="radial"
          startColor="#ffff8c42" endColor="#ff000000"
          start="0.500000,0.450000" end="1.000000,1.000000"/>
```

| Attribute | Type | Default | Notes |
| --- | --- | --- | --- |
| `type` | string | `linear` | `linear`, `radial`, or `sweep` |
| `startColor` | `#AARRGGBB` | black | Gradient start |
| `endColor` | `#AARRGGBB` | white | Gradient end |
| `start` | vec2 | `0,0` | Start point (normalized) |
| `end` | vec2 | `1,1` | End point (normalized) |

A gradient equal to the default (linear, black→white, `0,0`→`1,1`) is omitted entirely.

## Stroke, border, shadow, and glow

Outlines and shadows are **edge decorations**, written after the effects. The tag names
the kind:

| Tag | Kind |
| --- | --- |
| `border` | Border (inside / outside / centered) |
| `shadow` | Drop shadow |
| `glow` | Outer glow |
| `path-stroke` | Stroke around an imported shape's path |

```xml
<shadow direction="outside" color="#000000" opacity="0.500000" size="12.000000" hardness="0.400000" offset="0.000000,8.000000"/>
<border direction="inside" color="#ffffffff" size="4.000000"/>
```

- `direction` — `inside`, `outside`, or `centered`.
- `enabled` — written only when `false`.
- `color`, `size` — common to all decorations.
- `opacity`, `hardness` — shadows and glows.
- `offset` — shadows only (vec2).
- `id` — borders may carry one; strokes add `cap`, `join`, `start`, `end`, and
  `end-size` only when non-default.

## Text

```xml
<text id="2" label="Text 1" startTime="0" endTime="3000" fillType="color"
      size="72" font="googlefonts?name=Archivo Black&amp;weight=400"
      wrapWidth="512" align="center">
  <transform>…</transform>
  <fillColor value="#FFFFFFFF"/>
  <content>Hello world</content>
</text>
```

- `size` — font size (default `18`).
- `font` — font descriptor.
- `wrapWidth` — wrap width in px (default `512`).
- `align` — `left`, `center`, `right`, lowercased.
- `<content>` — the text itself, escaped as XML text.

## Effects

Apply an effect to an element by referencing the effect's `id` (the canonical id, also
listed on every [effect page](/effects/)):

```xml
<effect id="com.alightcreative.effects.box" locallyApplied="true">
  <property name="height" type="float" value="1.000000"/>
</effect>
```

| Attribute | Notes |
| --- | --- |
| `id` | Effect id — must match the XML `id` attribute, not the file name |
| `hidden` | Only when `true` |
| `locallyApplied` | Always written (bool) |

Effect parameters are `<property>` tags. Effects are ordered by their position in the
element's effect stack.

## Properties, keyframes, and easing

A property is keyable. Its serialization depends on its data type:

| `type` | Value form |
| --- | --- |
| `float` | `<property name="…" type="float" value="1.0"/>` |
| `int` | `<property name="…" type="int" value="2"/>` |
| `color` | `<property name="…" type="color" value="#AARRGGBB"/>` |
| `vec2` | `value="x,y"` |
| `vec3` | `value="x,y,z"` |
| `vec4` | `value="x,y,z,w"` |
| `quat` | `value="x,y,z,w"` |
| `bool` | `<property name="…" type="bool" value="true"/>` |
| `uri` | `<property name="…" type="uri" value="…"/>` |
| `string` | `<property name="…" type="string">text</property>` |

Rules:

- A property equal to its default value, with no keyframes and no animators, is
  **omitted entirely** — absence means "default".
- A non-keyed property writes only a `value` attribute.
- A keyed property writes `<kf>` children instead of a `value`, and each keyframe is:

```xml
<property name="size" type="float">
  <kf t="0.000000"  v="0.400000"/>
  <kf t="0.500000"  v="1.000000" e="cubicBezier 0.48022404 0.0 1.0 1.0"/>
</property>
```

| `kf` attribute | Notes |
| --- | --- |
| `t` | Time in seconds |
| `v` | Value at that time |
| `e` | Easing; omitted for linear. E.g. `cubicBezier x1 y1 x2 y2` |
| `s` | Smoothing; omitted when `none` |

## Media and bookmarks

Media used by the scene is declared once, before the elements. Attributes mirror the
app's `MediaUriInfo`:

| Attribute | Notes |
| --- | --- |
| `uri` | Source reference. Exported presets use `am-internal:///<sig>.<ext>`; other schemes are `content://`, `amproj`, and `am-docs` |
| `filename` | File name — exported presets store `<SIG>.<EXT>` |
| `title` | Display title |
| `type` | MIME type, e.g. `image/png`, `image/jpeg`, `video/mp4` |
| `size` | Byte size |
| `duration` | Length in ms (video/audio) |
| `sig` | Content signature / hash; also the internal file name, used to detect media changes |
| `orientation` | Rotation metadata |
| `width`, `height` | Pixel dimensions |
| `infoUpdated` | Last metadata refresh, ms epoch (optional) |

```xml
<media uri="am-internal:///AbC123.jpg" filename="AbC123.JPG" title="photo"
       type="image/jpeg" size="48213" sig="AbC123" infoUpdated="1615159537315"/>
```

A packaged project copies each media file into its internal store under `<sig>.<ext>`,
so the same `sig` appears in `uri`, `filename`, and `sig`.

Bookmarks are simple markers:

```xml
<bookmark t="21967"/>
<bookmark t="5000" audio="1"/>
```

## Adjustment layers and glow

The app builds color grading as a stack of **adjustment layers**: a full-frame element
that re-samples everything rendered beneath it instead of painting its own fill. The
first effect on such a layer is **Copy Background** (`com.alightcreative.effects.lift`)
with `fill="0"`:

```xml
<shape id="3" label="Grade" startTime="0" endTime="10000"
       fillType="color" mediaFillMode="stretch" s=".rect">
  <transform>
    <location value="540.000000,540.000000,0.000000"/>
    <scale value="10.800000,10.800000"/>
  </transform>
  <effect id="com.alightcreative.effects.lift" locallyApplied="true">
    <property name="fill" type="float" value="0.000000"/>
  </effect>
  <!-- grading effects go after the Copy Background -->
</shape>
```

Why it works: Copy Background computes `mix(comp * texColor.a, texColor, fill)`. With
`fill = 0` the result is the layer's texture alpha multiplied by the composite below — so
the layer becomes a pass over the whole image, and every effect that follows grades that
result. Without Copy Background the layer would just show its own shape.

- The plate must be **full-frame** to grade everything. A `.rect` template is `100×100`
  units, so scale it to cover the canvas: `scale = canvas / 100` (`1080 → 10.8`).
  Alternatively set `<property name="size" value="1080,1080"/>`. To grade only a media
  region, scale to that region instead (a 540 px placeholder uses `scale 5.45`).
- `fillType="color"` with no `fillColor` is the usual convention — the fill is discarded
  by Copy Background anyway.
- Put the grading layers **above** the content they affect, and share the same
  `startTime`/`endTime`.

### A multi-pass grade (orange & teal)

| Layer | Effects | Purpose |
| --- | --- | --- |
| Content | — | Background/media plus the subject |
| Duotone Core | `lift`, `colortune2`, `colorbalance`, `satvib` | Split-tone: teal shadows / orange highlights |
| Exposure Lift | `lift`, `exposure`, `brightcont2` | Tonal lift and contrast |
| Glow | `lift`, `gaussianblur`, `blending="screen"` | Bloom |
| Finishing | `lift`, `sharpen`, `vignette`, `noise3` | Detail, vignette, grain |

### Glow and bloom

A bloom is a blurred copy of the composite screened back over itself. Build it as an
adjustment layer with a radial gradient (its alpha fades the sample) and a blur:

```xml
<shape id="5" label="Glow" startTime="0" endTime="10000" fillType="color"
       blending="screen" mediaFillMode="stretch" s=".rect">
  <transform>
    <location value="540.000000,540.000000,0.000000"/>
    <scale value="10.800000,10.800000"/>
    <opacity value="0.400000"/>
  </transform>
  <gradient type="radial" startColor="#ffff8c42" endColor="#ff000000"
            start="0.500000,0.450000" end="1.000000,1.000000"/>
  <effect id="com.alightcreative.effects.lift" locallyApplied="true">
    <property name="fill" type="float" value="0.000000"/>
  </effect>
  <effect id="com.alightcreative.effects.gaussianblur" locallyApplied="true">
    <property name="strength" type="float" value="1.600000"/>
  </effect>
</shape>
```

For a soft glow on a single shape, apply `softglow`, `glow`, `lightglow`, `darkglow`, or
`edgeglow` directly to that shape. For a bloom over the whole image, use the
Copy-Background + blur + `blending="screen"` pass above.

Note: some effects are **not bundled** in the APK assets and are downloaded by the
Effect Browser at runtime (for example `com.alightcreative.effects.hsl`). Such a scene
still imports and renders once the effect is available.

## Minimal complete example

```xml
<scene title="New Project"
       width="1080" height="1080"
       exportWidth="1080" exportHeight="1080"
       bgcolor="#FFD8D8D8"
       totalTime="3000" fps="30"
       modifiedTime="1700000000000"
       amver="1028425" ffver="106"
       am="com.alightcreative.motion/5.0.273.1028425"
       amplatform="android">
  <shape id="1" label="Rectangle 1" startTime="0" endTime="3000"
         fillType="color" s=".rect">
    <transform>
      <location value="540.000000,540.000000,0.000000"/>
    </transform>
    <fillColor value="#FFE3914C"/>
    <effect id="com.alightcreative.effects.box" locallyApplied="true">
      <property name="height" type="float" value="0.500000"/>
    </effect>
    <property name="size" type="vec2" value="540.000000,540.000000"/>
  </shape>
</scene>
```

## Generation checklist

1. Pick `width`/`height`/`exportWidth`/`exportHeight`, `totalTime`, and `fps`.
2. Set `bgcolor`, `title`, `modifiedTime`, `amver`, `ffver`, `am`, `amplatform`.
3. Declare any `media` before elements.
4. Add elements with unique ascending `id`s, `startTime`/`endTime`, and a `label`.
5. Give each element a `transform` and its type-specific content (shape `s` + params,
   text `size`/`font`/`content`, …).
6. Attach effects with the correct effect `id` and `<property>` params.
7. Use keyframes for animation; omit any value equal to its default.

::: warning
Effect `id` values are the canonical ids from the effect XML `id` attribute — they do
not always match the file name (for example `com.alightcreative.effects.box` lives in
`s3d-box.xml`). Always use the id shown on the [effect pages](/effects/).
:::
