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

### Defaults for a new project

- **Frame rate:** `30` fps. The picker offers `12, 15, 18, 20, 24, 25, 30, 48, 50, 60`
  (rates ≥ 35 fps are only offered below the device's max resolution).
- **Background:** `Light Grey`. Options are `Black`, `White`, `Light Grey`, `Green`,
  `Blue`, `Transparent` (encoded as `#AARRGGBB`).
- **Name:** the base name is `New Project` (or `New Element`). The app picks the first
  unused candidate: `New Project`, `New Project 1`, `New Project 2`, …

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
7. `stroke` / borders / `dropShadow`

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
- A non-live (imported) shape uses a `<parameter>` element containing `contour`/`knot`
  outline data instead of `s` and properties.

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
<effect id="com.alightcreative.effects.box" locallyApplied="false">
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

Media used by the scene is declared once, before the elements:

```xml
<media uri="am-internal:///AbC123.jpg" filename="photo.jpg" title="photo"
       type="image/jpeg" size="48213" duration="0"
       sig="…" orientation="0" width="1920" height="1080"/>
```

Bookmarks are simple markers:

```xml
<bookmark t="21967"/>
<bookmark t="5000" audio="1"/>
```

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
    <property name="size" type="vec2" value="540.000000,540.000000"/>
    <effect id="com.alightcreative.effects.box" locallyApplied="false">
      <property name="height" type="float" value="0.500000"/>
    </effect>
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
