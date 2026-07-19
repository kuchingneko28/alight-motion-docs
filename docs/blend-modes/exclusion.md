---
title: Exclusion
description: "Exclusion blending mode — Difference category. Similar to Difference but with lower contrast. Black produces no change, white inverts to ~50% gray."
---

# Exclusion <Badge type="info" text="Difference" />

> Similar to Difference but with lower contrast. Black produces no change, white inverts to ~50% gray.

## GLSL Shader

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

## See Also

- [Getting Started Guide](/guide#blend-modes) — learn how blend modes work
- [All Blend Modes](/blend-modes/) — browse all 24 blend modes