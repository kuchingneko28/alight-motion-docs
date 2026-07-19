---
title: Hard Light
description: "Hard Light blending mode — Contrast category. Like Overlay but with the roles of top and bottom swapped. The top layer controls the contrast effect."
---

# Hard Light <Badge type="info" text="Contrast" />

> Like Overlay but with the roles of top and bottom swapped. The top layer controls the contrast effect.

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
                    t * (1. - (1.-bot) * (1.-2.*(top-0.5))) +
                    (1.-t) * (bot * (2.*top));

            // Output result
            gl_FragColor = vec4(result,texColor.a);
        }
```

## See Also

- [Getting Started Guide](/guide#blend-modes) — learn how blend modes work
- [All Blend Modes](/blend-modes/) — browse all 24 blend modes