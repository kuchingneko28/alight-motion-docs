---
title: Difference Blend Modes
description: Alight Motion difference blend modes — visual explanations and GLSL shaders.
---

# Difference Blend Modes

These blend modes are grouped under the **Difference** category. they modify color values to shift layers towards difference styles.

## Difference

> Subtracts the darker from the lighter, channel by channel. Black produces no change, white inverts.

<details>
<summary><strong>GLSL Shader Source</strong></summary>

```glsl
void main() {
            vec4 texColor = texture2DCv(inputImg.texture,acScreenNorm);
            vec4 compColor = texture2DCv(comp.texture,acScreenNorm);
            gl_FragColor = vec4(abs(compColor.rgb*texColor.a - texColor.rgb),texColor.a);
        }
```

</details>

## Exclusion

> Similar to Difference but with lower contrast. Black produces no change, white inverts to ~50% gray.

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
            vec3 result = 0.5 - 2.*(bot-0.5)*(top-0.5);

            // Output result
            gl_FragColor = vec4(result,texColor.a);
        }
```

</details>

## See Also

- [All Blend Modes](/blend-modes/) — overview of all categories
- [Getting Started Guide](/guide#blend-modes) — learn how blend modes work