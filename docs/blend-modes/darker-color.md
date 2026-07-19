---
title: Darker Color
description: "Darker Color blending mode — Darken category. Compares the overall brightness of top and bottom — keeps the darker pixel entirely."
---

# Darker Color <Badge type="info" text="Darken" />

> Compares the overall brightness of top and bottom — keeps the darker pixel entirely.

## GLSL Shader

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

## See Also

- [Getting Started Guide](/guide#blend-modes) — learn how blend modes work
- [All Blend Modes](/blend-modes/) — browse all 24 blend modes