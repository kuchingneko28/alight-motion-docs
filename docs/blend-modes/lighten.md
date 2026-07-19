---
title: Lighten Blend Modes
description: Alight Motion lighten blend modes — visual explanations and GLSL shaders.
---

# Lighten Blend Modes

These blend modes are grouped under the **Lighten** category. they modify color values to shift layers towards lighten styles.

## Color Dodge

> Brightens the bottom layer by dividing by the inverse of the top layer. White turns white, black has no effect.

<details>
<summary><strong>GLSL Shader Source</strong></summary>

```glsl
void main() {
            // Setup
            vec4 texColor = texture2DCv(inputImg.texture,acScreenNorm);
            vec4 compColor = texture2DCv(comp.texture,acScreenNorm);
            vec3 top = texColor.rgb;
            vec3 bot = compColor.rgb * texColor.a;

            // Blend top, bot
            vec3 result = bot / (1. - top);

            // Output result
            gl_FragColor = vec4(result,texColor.a);
        }
```

</details>

## Divide

> Divides the bottom color by the top color. Brightens the result. Black in the top layer makes white.

<details>
<summary><strong>GLSL Shader Source</strong></summary>

```glsl
void main() {
            // Setup
            vec4 texColor = texture2DCv(inputImg.texture,acScreenNorm);
            vec4 compColor = texture2DCv(comp.texture,acScreenNorm);
            vec3 top = texColor.rgb;
            vec3 bot = compColor.rgb * texColor.a;

            // Blend top, bot
            vec3 result = bot / top;

            // Output result
            gl_FragColor = vec4(result,texColor.a);
        }
```

</details>

## Lighten

> Keeps the lighter of the two color channels (R, G, B independently).

<details>
<summary><strong>GLSL Shader Source</strong></summary>

```glsl
void main() {
            // Setup
            vec4 texColor = texture2DCv(inputImg.texture,acScreenNorm);
            vec4 compColor = texture2DCv(comp.texture,acScreenNorm);
            vec3 top = texColor.rgb;
            vec3 bot = compColor.rgb * texColor.a;

            // Blend top, bot
            vec3 result = max(top,bot);

            // Output result
            gl_FragColor = vec4(result,texColor.a);
        }
```

</details>

## Lighter Color

> Compares the overall brightness of top and bottom — keeps the lighter pixel entirely.

<details>
<summary><strong>GLSL Shader Source</strong></summary>

```glsl
const vec3 luminanceWeighting = vec3(0.2126, 0.7152, 0.0722);

        void main() {
            // Setup
            vec4 texColor = texture2DCv(inputImg.texture,acScreenNorm);
            vec4 compColor = texture2DCv(comp.texture,acScreenNorm);
            vec3 top = texColor.rgb;
            vec3 bot = compColor.rgb * texColor.a;

            // Blend top, bot
            vec3 result = length(luminanceWeighting * top) > length(luminanceWeighting * bot) ? top : bot;

            // Output result
            gl_FragColor = vec4(result,texColor.a);
        }
```

</details>

## Linear Dodge

> Adds the top and bottom colors together. Lightens the result — black has no effect.

<details>
<summary><strong>GLSL Shader Source</strong></summary>

```glsl
void main() {
            // Setup
            vec4 texColor = texture2DCv(inputImg.texture,acScreenNorm);
            vec4 compColor = texture2DCv(comp.texture,acScreenNorm);
            vec3 top = texColor.rgb;
            vec3 bot = compColor.rgb * texColor.a;

            // Blend top, bot
            vec3 result = bot + top;

            // Output result
            gl_FragColor = vec4(result,texColor.a);
        }
```

</details>

## See Also

- [All Blend Modes](/blend-modes/) — overview of all categories
- [Getting Started Guide](/guide#blend-modes) — learn how blend modes work