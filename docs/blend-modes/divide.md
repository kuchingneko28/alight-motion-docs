---
title: Divide
description: "Divide blending mode — Lighten category. Divides the bottom color by the top color. Brightens the result. Black in the top layer makes white."
---

# Divide <Badge type="info" text="Lighten" />

> Divides the bottom color by the top color. Brightens the result. Black in the top layer makes white.

## GLSL Shader

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

## See Also

- [Getting Started Guide](/guide#blend-modes) — learn how blend modes work
- [All Blend Modes](/blend-modes/) — browse all 24 blend modes