---
title: Color Burn
description: "Color Burn blending mode — Darken category. Darkens the bottom layer by inverting, dividing, and inverting. White has no effect, black makes black."
---

# Color Burn <Badge type="info" text="Darken" />

> Darkens the bottom layer by inverting, dividing, and inverting. White has no effect, black makes black.

## GLSL Shader

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

## See Also

- [Getting Started Guide](/guide#blend-modes) — learn how blend modes work
- [All Blend Modes](/blend-modes/) — browse all 24 blend modes