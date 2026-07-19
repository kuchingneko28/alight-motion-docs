---
title: Overlay
description: "Overlay blending mode — Contrast category. Combines Multiply and Screen. Dark areas get darker, light areas get lighter, midtones are preserved."
---

# Overlay <Badge type="info" text="Contrast" />

> Combines Multiply and Screen. Dark areas get darker, light areas get lighter, midtones are preserved.

## GLSL Shader

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

## See Also

- [Getting Started Guide](/guide#blend-modes) — learn how blend modes work
- [All Blend Modes](/blend-modes/) — browse all 24 blend modes