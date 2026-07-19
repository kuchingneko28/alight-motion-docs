---
title: Linear Light
description: "Linear Light blending mode — Contrast category. Combines Linear Dodge and Linear Burn. Burns or dodges based on the top layer."
---

# Linear Light <Badge type="info" text="Contrast" />

> Combines Linear Dodge and Linear Burn. Burns or dodges based on the top layer.

## GLSL Shader

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

## See Also

- [Getting Started Guide](/guide#blend-modes) — learn how blend modes work
- [All Blend Modes](/blend-modes/) — browse all 24 blend modes