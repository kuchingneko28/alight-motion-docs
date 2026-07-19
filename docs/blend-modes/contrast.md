---
title: Contrast Blend Modes
description: Alight Motion contrast blend modes — visual explanations and GLSL shaders.
---

# Contrast Blend Modes

These blend modes are grouped under the **Contrast** category. they modify color values to shift layers towards contrast styles.

## Hard Light

> Like Overlay but with the roles of top and bottom swapped. The top layer controls the contrast effect.

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
            vec3 t = smoothstep(0.5,0.5,top);
            vec3 result =
                    t * (1. - (1.-bot) * (1.-2.*(top-0.5))) +
                    (1.-t) * (bot * (2.*top));

            // Output result
            gl_FragColor = vec4(result,texColor.a);
        }
```

</details>

## Linear Light

> Combines Linear Dodge and Linear Burn. Burns or dodges based on the top layer.

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
            vec3 t = smoothstep(0.5,0.5,top);
            vec3 result =
                    t * (bot + 2.*(top-0.5)) +
                    (1.-t) * (bot + 2.*top - 1.)	;

            // Output result
            gl_FragColor = vec4(result,texColor.a);
        }
```

</details>

## Overlay

> Combines Multiply and Screen. Dark areas get darker, light areas get lighter, midtones are preserved.

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
            vec3 t = smoothstep(0.5,0.5,bot);
            vec3 result =
                    t * (1. - (1.-2.*(bot-0.5)) * (1.-top)) +
                    (1.-t) * ((2.*bot) * top);

            // Output result
            gl_FragColor = vec4(result,texColor.a);
        }
```

</details>

## Pin Light

> Replaces colors based on the top layer. If the top is darker than 50%, dark pixels pass through.

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
            vec3 t = smoothstep(0.5,0.5,top);
            vec3 result =
                    t * (max(bot,2.*(top-0.5))) +
                    (1.-t) * (min(bot,2.*top));

            // Output result
            gl_FragColor = vec4(result,texColor.a);

        }
```

</details>

## Soft Light

> A softer version of Overlay. Darkens or lightens the bottom layer based on the top layer's luminance.

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
            vec3 t = smoothstep(0.5,0.5,top);
            vec3 result =
                    t * (1. - (1.-bot) * (1.-(top-0.5))) +
                    (1.-t) * (bot * (top+0.5));

            // Output result
            gl_FragColor = vec4(result,texColor.a);
        }
```

</details>

## Soft Overlay

> A very soft overlay effect — subtle contrast enhancement.

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
            vec3 t = smoothstep(0.5,0.5,bot);
            vec3 result =
                    t * (1. - (1.-bot) * (1.-(top-0.5))) +
                    (1.-t) * (bot * (top+0.5));

            // Output result
            gl_FragColor = vec4(result,texColor.a);
        }
```

</details>

## Vivid Light

> Combines Color Dodge and Color Burn. Dodges or burns based on the top layer's luminance.

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
            vec3 t = smoothstep(0.5,0.5,top);
            vec3 result =
                    t * (1. - (1.-bot) * (2.*(top-0.5))) +
                    (1.-t) * (bot * (1.-2.*top));

            // Output result
            gl_FragColor = vec4(result,texColor.a);
        }
```

</details>

## See Also

- [All Blend Modes](/blend-modes/) — overview of all categories
- [Getting Started Guide](/guide#blend-modes) — learn how blend modes work