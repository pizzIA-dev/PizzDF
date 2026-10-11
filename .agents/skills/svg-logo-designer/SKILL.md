---
name: svg-logo-designer
description: >-
  Expert guidelines and procedures for crafting vector SVG brand logos, modern geometric icons,
  app emblems, and scalable favicons with high precision, mathematical harmony, and clean markup.
---

# SVG Logo Designer Skill

 Principles of Elite Vector Logo Design

1. **Geometric Singularity**:
   - A great logo is a single unified visual form, never a clip-art icon awkwardly pasted inside a box.
   - Synthesize dual metaphors (e.g., Document + Pizza slice) into one cohesive silhouette.

2. **Pixel-Grid Alignment & Scalability**:
   - Work on standard coordinate grids (typically `0 0 32 32` or `0 0 24 24`).
   - Use integer or 0.5-precision coordinates for crisp rendering from 16x16 (favicon) to high-DPI display.
   - Maintain a clear stroke width hierarchy (primary contour 1.5–2px, interior detail 1–1.25px).

3. **Color Harmony & Tactility**:
   - Semantic gradients with distinct light/shadow facets to convey tactile depth (origami / paper folds).
   - High contrast against both pure paper (`#ffffff`) and warm surfaces (`#faf7f2`).
4> **Semantic SVG Hygiene**:
   - Clean `<defs>` with `<linearGradient>`.
   - Avoid bloated export metadata, empty groups, or raster artifacts.
   - Use `stroke-linecap="round"` and `stroke-linejoin="round"` for a polished finish.
