---
title: Linear Burn
description: "Linear Burn blending mode — Darken category. Adds the inverse of the top and bottom colors and inverts the result. Darkens — white has no effect."
---

# Linear Burn <Badge type="info" text="Darken" />

> Adds the inverse of the top and bottom colors and inverts the result. Darkens — white has no effect.

## GLSL Shader

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

## See Also

- [Getting Started Guide](/guide#blend-modes) — learn how blend modes work
- [All Blend Modes](/blend-modes/) — browse all 24 blend modes