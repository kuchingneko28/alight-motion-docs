---
title: Color Blend Modes
description: Alight Motion color blend modes — visual explanations and GLSL shaders.
---

# Color Blend Modes

These blend modes are grouped under the **Color** category. they modify color values to shift layers towards color styles.

## Color

> Takes the hue + saturation of the top layer and the luminance of the bottom layer.

<details>
<summary><strong>GLSL Shader Source</strong></summary>

```glsl
void main() {

            highp mat3 rgb2yuv = mat3(
                 0.299,     0.587,    0.114,
                -0.14713,  -0.28886,  0.436,
                 0.615,    -0.51499, -0.10001
            );
            highp mat3 yuv2rgb = mat3(
                1.0,  0.0,      1.13983,
                1.0, -0.39465, -0.58060,
                1.0,  2.03211,  0.0
            );

            // Setup
            vec4 texColor = texture2DCv(inputImg.texture,acScreenNorm);
            vec4 compColor = texture2DCv(comp.texture,acScreenNorm);
            vec3 top = texColor.rgb;
            vec3 bot = compColor.rgb * texColor.a;

            // Blend top, bot
            vec3 result = vec3( (bot * rgb2yuv).r, (top * rgb2yuv).gb) * yuv2rgb;

            // Output result
            gl_FragColor = vec4(result,texColor.a);
        }
```

</details>

## Color Multiply

> Multiplies colors while preserving luminance of the bottom layer.

<details>
<summary><strong>GLSL Shader Source</strong></summary>

```glsl
void main() {
            // Setup
            vec4 texColor = texture2DCv(inputImg.texture,acScreenNorm);
            vec4 compColor = texture2DCv(comp.texture,acScreenNorm);
            vec4 backgrnd = vec4(1.0,1.0,1.0,1.0)*(1.0-compColor.a)+compColor*compColor.a;
            gl_FragColor = texColor*backgrnd;
        }
```

</details>

## Hue

> Takes the hue of the top layer and the saturation + luminance of the bottom layer.

<details>
<summary><strong>GLSL Shader Source</strong></summary>

```glsl
vec3 hsv2rgb(vec3 c)
        {
            vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
            vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
            return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
        }

        vec3 rgb2hsv(vec3 c)
        {
            vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
            vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
            vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

            float d = q.x - min(q.w, q.y);
            float e = 1.0e-10;
            return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
        }


        void main() {
            // Setup
            vec4 texColor = texture2DCv(inputImg.texture,acScreenNorm);
            vec4 compColor = texture2DCv(comp.texture,acScreenNorm);
            vec3 top = texColor.rgb;
            vec3 bot = compColor.rgb * texColor.a;

            // Blend top, bot
            vec3 result = hsv2rgb(vec3(rgb2hsv(top).r, rgb2hsv(bot).gb));

            // Output result
            gl_FragColor = vec4(result,texColor.a);
        }
```

</details>

## Luminance

> Takes the luminance of the top layer and the hue + saturation of the bottom layer.

<details>
<summary><strong>GLSL Shader Source</strong></summary>

```glsl
void main() {

            highp mat3 rgb2yuv = mat3(
                 0.299,     0.587,    0.114,
                -0.14713,  -0.28886,  0.436,
                 0.615,    -0.51499, -0.10001
            );
            highp mat3 yuv2rgb = mat3(
                1.0,  0.0,      1.13983,
                1.0, -0.39465, -0.58060,
                1.0,  2.03211,  0.0
            );

            // Setup
            vec4 texColor = texture2DCv(inputImg.texture,acScreenNorm);
            vec4 compColor = texture2DCv(comp.texture,acScreenNorm);
            vec3 top = texColor.rgb;
            vec3 bot = compColor.rgb * texColor.a;

            // Blend top, bot
            vec3 result = vec3( (top * rgb2yuv).r, (bot * rgb2yuv).gb) * yuv2rgb;

            // Output result
            gl_FragColor = vec4(result,texColor.a);
        }
```

</details>

## Saturation

> Takes the saturation of the top layer and the hue + luminance of the bottom layer.

<details>
<summary><strong>GLSL Shader Source</strong></summary>

```glsl
vec3 hsv2rgb(vec3 c)
        {
            vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
            vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
            return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
        }

        vec3 rgb2hsv(vec3 c)
        {
            vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
            vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
            vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

            float d = q.x - min(q.w, q.y);
            float e = 1.0e-10;
            return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
        }


        void main() {
            // Setup
            vec4 texColor = texture2DCv(inputImg.texture,acScreenNorm);
            vec4 compColor = texture2DCv(comp.texture,acScreenNorm);
            vec3 top = texColor.rgb;
            vec3 bot = compColor.rgb * texColor.a;

            // Blend top, bot
            vec3 bot_hsv = rgb2hsv(bot);
            vec3 result = hsv2rgb(vec3(bot_hsv.r, rgb2hsv(top).g, bot_hsv.b));

            // Output result
            gl_FragColor = vec4(result,texColor.a);
        }
```

</details>

## See Also

- [All Blend Modes](/blend-modes/) — overview of all categories
- [Getting Started Guide](/guide#blend-modes) — learn how blend modes work