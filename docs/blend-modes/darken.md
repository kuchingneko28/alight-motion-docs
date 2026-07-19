---
title: Darken Blend Modes
description: Alight Motion darken blend modes — visual explanations and GLSL shaders.
---

# Darken Blend Modes

These blend modes are grouped under the **Darken** category. they modify color values to shift layers towards darken styles.

## Color Burn

> Darkens the bottom layer by inverting, dividing, and inverting. White has no effect, black makes black.

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
            vec3 result = 1. - (1.-bot) / top;

            // Output result
            gl_FragColor = vec4(result,texColor.a);
        }
```

</details>

## Darken

> Keeps the darker of the two color channels (R, G, B independently).

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
            vec3 result = min(top,bot);

            // Output result
            gl_FragColor = vec4(result,texColor.a);
        }
```

</details>

## Darker Color

> Compares the overall brightness of top and bottom — keeps the darker pixel entirely.

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
            vec3 result = length(luminanceWeighting * top) > length(luminanceWeighting * bot) ? bot : top;

            // Output result
            gl_FragColor = vec4(result,texColor.a);
        }
```

</details>

## Linear Burn

> Adds the inverse of the top and bottom colors and inverts the result. Darkens — white has no effect.

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
            vec3 result = top + bot - 1.;

            // Output result
            gl_FragColor = vec4(result,texColor.a);
        }
```

</details>

## Subtract

> Subtracts the top color from the bottom color. Darkens the result. White in the top layer makes black.

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
            vec3 result = bot - top;

            // Output result
            gl_FragColor = vec4(result,texColor.a);
        }
```

</details>

## See Also

- [All Blend Modes](/blend-modes/) — overview of all categories
- [Getting Started Guide](/guide#blend-modes) — learn how blend modes work