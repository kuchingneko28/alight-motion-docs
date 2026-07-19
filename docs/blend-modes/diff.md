---
title: Difference
description: "Difference blending mode — Difference category. Subtracts the darker from the lighter, channel by channel. Black produces no change, white inverts."
---

# Difference <Badge type="info" text="Difference" />

> Subtracts the darker from the lighter, channel by channel. Black produces no change, white inverts.

## GLSL Shader

```glsl
void main() {
            vec4 texColor = texture2DCv(inputImg.texture,acScreenNorm);
            vec4 compColor = texture2DCv(comp.texture,acScreenNorm);
            gl_FragColor = vec4(abs(compColor.rgb*texColor.a - texColor.rgb),texColor.a);
        }
```

## See Also

- [Getting Started Guide](/guide#blend-modes) — learn how blend modes work
- [All Blend Modes](/blend-modes/) — browse all 24 blend modes