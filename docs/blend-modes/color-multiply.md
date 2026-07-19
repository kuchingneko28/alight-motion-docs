---
title: Color Multiply
description: "Color Multiply blending mode — Color category. Multiplies colors while preserving luminance of the bottom layer."
---

# Color Multiply <Badge type="info" text="Color" />

> Multiplies colors while preserving luminance of the bottom layer.

## GLSL Shader

```glsl
void main() {
            // Setup
            vec4 texColor = texture2DCv(inputImg.texture,acScreenNorm);
            vec4 compColor = texture2DCv(comp.texture,acScreenNorm);
            vec4 backgrnd = vec4(1.0,1.0,1.0,1.0)*(1.0-compColor.a)+compColor*compColor.a;
            gl_FragColor = texColor*backgrnd;
        }
```

## See Also

- [Getting Started Guide](/guide#blend-modes) — learn how blend modes work
- [All Blend Modes](/blend-modes/) — browse all 24 blend modes