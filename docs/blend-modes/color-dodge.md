---
title: Color Dodge
description: "Color Dodge blending mode — Lighten category. Brightens the bottom layer by dividing by the inverse of the top layer. White turns white, black has no effect."
---

# Color Dodge <Badge type="info" text="Lighten" />

> Brightens the bottom layer by dividing by the inverse of the top layer. White turns white, black has no effect.

## GLSL Shader

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

## See Also

- [Getting Started Guide](/guide#blend-modes) — learn how blend modes work
- [All Blend Modes](/blend-modes/) — browse all 24 blend modes