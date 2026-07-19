---
title: Shape Templates
description: All 20 built-in shape templates in Alight Motion — parameters, SVGs, and on-canvas handles.
---

# Shape Templates

Alight Motion includes **20 built-in shape templates**. Each shape is defined by an XML template with parameters and custom path generation.

> Learn how shapes work in the [Getting Started Guide](/guide#shape-templates). below is a gallery of all templates with their default appearance and parameters.

## Gallery

- **[Arc](#arc)** — A curved line segment defined by start angle, end angle, and radius.
- **[Arrow](#arrow)** — A line with an arrowhead at one end.
- **[Callout](#calloutrr)** — A rounded rectangle speech bubble / callout shape.
- **[Circle](#circle)** — A perfect ellipse (oval or circle).
- **[Irregular Pentagon](#penta)** — A pentagram / star polygon.
- **[Line](#line)** — A straight line segment between two points.
- **[Moon](#moon)** — A crescent moon shape.
- **[Multifoil](#multifoil)** — A multi-lobed flower / clover shape (trefoil, quatrefoil, etc.).
- **[Pie](#pie)** — A pie/wedge shape (like a pizza slice).
- **[Plus](#plus)** — A plus/cross shape.
- **[Polygon](#poly)** — A regular polygon with configurable side count.
- **[Quad](#quad)** — A quadrilateral with four adjustable corners.
- **[Rectangle](#rect)** — A rectangle with adjustable width and height.
- **[Rounded Rectangle](#roundrect)** — A rounded rectangle with corner radius control.
- **[Stamp](#stamp)** — A multi-purpose stamp shape with configurable lobes and indentation.
- **[Star](#star)** — A star shape with configurable point count and inner/outer radius.
- **[Teardrop](#teardrop)** — A teardrop / droplet shape.
- **[testshape](#testshape)** — A simple test shape for debugging.
- **[Triangle](#triangle)** — An equilateral triangle.
- **[Wide Line](#wideline)** — A wide rectangular line / bar.

---

## Arc

> A curved line segment defined by start angle, end angle, and radius.

<div class="shape-preview">
  <img src="/shapes/arc.svg" alt="Arc preview" />
</div>

<table>
<thead><tr><th>Parameter</th><th>Type</th><th>Default</th><th>Min</th><th>Max</th></tr></thead>
<tbody>
<tr><td>Start</td><td>Number</td><td>0</td><td>-3600</td><td>3600</td></tr>
<tr><td>End</td><td>Number</td><td>90</td><td>-3600</td><td>3600</td></tr>
<tr><td>Radius</td><td>Number</td><td>100</td><td>0</td><td>2000</td></tr>
<tr><td>Closed</td><td>Toggle</td><td>false</td><td><span class="value-missing">—</span></td><td><span class="value-missing">—</span></td></tr>
</tbody>
</table>

**On-canvas handles:** 3 · Custom JavaScript path generation

---

## Arrow

> A line with an arrowhead at one end.

<div class="shape-preview">
  <img src="/shapes/arrow.svg" alt="Arrow preview" />
</div>

<table>
<thead><tr><th>Parameter</th><th>Type</th><th>Default</th><th>Min</th><th>Max</th></tr></thead>
<tbody>
<tr><td>Start</td><td>Point (X, Y)</td><td>0,0</td><td><span class="value-missing">—</span></td><td><span class="value-missing">—</span></td></tr>
<tr><td>End</td><td>Point (X, Y)</td><td>250,-250</td><td><span class="value-missing">—</span></td><td><span class="value-missing">—</span></td></tr>
<tr><td>Tail Width</td><td>Number</td><td>40</td><td>0</td><td>2000</td></tr>
<tr><td>Head Width</td><td>Number</td><td>120</td><td>0</td><td>2000</td></tr>
<tr><td>Head Length</td><td>Number</td><td>130</td><td>0</td><td>2000</td></tr>
</tbody>
</table>

**On-canvas handles:** 5 · Custom JavaScript path generation

---

## Callout

> A rounded rectangle speech bubble / callout shape.

<div class="shape-preview">
  <img src="/shapes/calloutrr.svg" alt="Callout preview" />
</div>

<table>
<thead><tr><th>Parameter</th><th>Type</th><th>Default</th><th>Min</th><th>Max</th></tr></thead>
<tbody>
<tr><td>Size</td><td>Point (X, Y)</td><td>100,100</td><td>1,1</td><td><span class="value-missing">—</span></td></tr>
<tr><td>Tail</td><td>Point (X, Y)</td><td>-50,150</td><td><span class="value-missing">—</span></td><td><span class="value-missing">—</span></td></tr>
<tr><td>Radius</td><td>Number</td><td>25</td><td>0</td><td>2000</td></tr>
<tr><td>Tail Width</td><td>Number</td><td>40</td><td>0</td><td>2000</td></tr>
</tbody>
</table>

**On-canvas handles:** 6 · Custom JavaScript path generation

---

## Circle

> A perfect ellipse (oval or circle).

<div class="shape-preview">
  <img src="/shapes/circle.svg" alt="Circle preview" />
</div>

<table>
<thead><tr><th>Parameter</th><th>Type</th><th>Default</th><th>Min</th><th>Max</th></tr></thead>
<tbody>
<tr><td>Size</td><td>Point (X, Y)</td><td>100,100</td><td><span class="value-missing">—</span></td><td><span class="value-missing">—</span></td></tr>
</tbody>
</table>

**On-canvas handles:** 8 · Custom JavaScript path generation

---

## Irregular Pentagon

> A pentagram / star polygon.

<div class="shape-preview">
  <img src="/shapes/penta.svg" alt="Irregular Pentagon preview" />
</div>

<table>
<thead><tr><th>Parameter</th><th>Type</th><th>Default</th><th>Min</th><th>Max</th></tr></thead>
<tbody>
<tr><td>Point 1</td><td>Point (X, Y)</td><td>-100,-100</td><td><span class="value-missing">—</span></td><td><span class="value-missing">—</span></td></tr>
<tr><td>Point 2</td><td>Point (X, Y)</td><td>0,-100</td><td><span class="value-missing">—</span></td><td><span class="value-missing">—</span></td></tr>
<tr><td>Point 3</td><td>Point (X, Y)</td><td>0,0</td><td><span class="value-missing">—</span></td><td><span class="value-missing">—</span></td></tr>
<tr><td>Point 4</td><td>Point (X, Y)</td><td>100,100</td><td><span class="value-missing">—</span></td><td><span class="value-missing">—</span></td></tr>
<tr><td>Point 5</td><td>Point (X, Y)</td><td>-100,100</td><td><span class="value-missing">—</span></td><td><span class="value-missing">—</span></td></tr>
<tr><td>Closed</td><td>Toggle</td><td>true</td><td><span class="value-missing">—</span></td><td><span class="value-missing">—</span></td></tr>
</tbody>
</table>

**On-canvas handles:** 2 · Custom JavaScript path generation

---

## Line

> A straight line segment between two points.

<div class="shape-preview">
  <img src="/shapes/line.svg" alt="Line preview" />
</div>

<table>
<thead><tr><th>Parameter</th><th>Type</th><th>Default</th><th>Min</th><th>Max</th></tr></thead>
<tbody>
<tr><td>Point 1</td><td>Point (X, Y)</td><td>-100,100</td><td><span class="value-missing">—</span></td><td><span class="value-missing">—</span></td></tr>
<tr><td>Point 2</td><td>Point (X, Y)</td><td>100,-100</td><td><span class="value-missing">—</span></td><td><span class="value-missing">—</span></td></tr>
</tbody>
</table>

**On-canvas handles:** 2 · Custom JavaScript path generation

---

## Moon

> A crescent moon shape.

<div class="shape-preview">
  <img src="/shapes/moon.svg" alt="Moon preview" />
</div>

<table>
<thead><tr><th>Parameter</th><th>Type</th><th>Default</th><th>Min</th><th>Max</th></tr></thead>
<tbody>
<tr><td>Radius</td><td>Number</td><td>100</td><td>0</td><td>2000</td></tr>
<tr><td>Offset</td><td>Number</td><td>250</td><td>0</td><td>1000</td></tr>
</tbody>
</table>

**On-canvas handles:** 3 · Custom JavaScript path generation

---

## Multifoil

> A multi-lobed flower / clover shape (trefoil, quatrefoil, etc.).

<div class="shape-preview">
  <img src="/shapes/multifoil.svg" alt="Multifoil preview" />
</div>

<table>
<thead><tr><th>Parameter</th><th>Type</th><th>Default</th><th>Min</th><th>Max</th></tr></thead>
<tbody>
<tr><td>Points</td><td>Slider</td><td>5</td><td>3</td><td>32</td></tr>
<tr><td>Outer Radius</td><td>Number</td><td>100</td><td>0</td><td>2000</td></tr>
<tr><td>Inner Radius</td><td>Number</td><td>50</td><td>0</td><td>2000</td></tr>
<tr><td>Angle</td><td>Number</td><td>0</td><td>-3600</td><td>3600</td></tr>
</tbody>
</table>

**On-canvas handles:** 5 · Custom JavaScript path generation

---

## Pie

> A pie/wedge shape (like a pizza slice).

<div class="shape-preview">
  <img src="/shapes/pie.svg" alt="Pie preview" />
</div>

<table>
<thead><tr><th>Parameter</th><th>Type</th><th>Default</th><th>Min</th><th>Max</th></tr></thead>
<tbody>
<tr><td>Start</td><td>Number</td><td>45</td><td>-3600</td><td>3600</td></tr>
<tr><td>End</td><td>Number</td><td>90</td><td>-3600</td><td>3600</td></tr>
<tr><td>Radius</td><td>Number</td><td>100</td><td>0</td><td>2000</td></tr>
</tbody>
</table>

**On-canvas handles:** 3 · Custom JavaScript path generation

---

## Plus

> A plus/cross shape.

<div class="shape-preview">
  <img src="/shapes/plus.svg" alt="Plus preview" />
</div>

<table>
<thead><tr><th>Parameter</th><th>Type</th><th>Default</th><th>Min</th><th>Max</th></tr></thead>
<tbody>
<tr><td>Size</td><td>Point (X, Y)</td><td>100,100</td><td><span class="value-missing">—</span></td><td><span class="value-missing">—</span></td></tr>
<tr><td>Width</td><td>Number</td><td>50</td><td>0</td><td>2000</td></tr>
</tbody>
</table>

**On-canvas handles:** 2 · Custom JavaScript path generation

---

## Polygon

> A regular polygon with configurable side count.

<div class="shape-preview">
  <img src="/shapes/poly.svg" alt="Polygon preview" />
</div>

<table>
<thead><tr><th>Parameter</th><th>Type</th><th>Default</th><th>Min</th><th>Max</th></tr></thead>
<tbody>
<tr><td>Sides</td><td>Slider</td><td>6</td><td>3</td><td>32</td></tr>
<tr><td>Radius</td><td>Number</td><td>100</td><td>0</td><td>2000</td></tr>
<tr><td>Angle</td><td>Number</td><td>0</td><td>-3600</td><td>3600</td></tr>
</tbody>
</table>

**On-canvas handles:** 2 · Custom JavaScript path generation

---

## Quad

> A quadrilateral with four adjustable corners.

<div class="shape-preview">
  <img src="/shapes/quad.svg" alt="Quad preview" />
</div>

<table>
<thead><tr><th>Parameter</th><th>Type</th><th>Default</th><th>Min</th><th>Max</th></tr></thead>
<tbody>
<tr><td>Point 1</td><td>Point (X, Y)</td><td>-100,-100</td><td><span class="value-missing">—</span></td><td><span class="value-missing">—</span></td></tr>
<tr><td>Point 2</td><td>Point (X, Y)</td><td>50,-100</td><td><span class="value-missing">—</span></td><td><span class="value-missing">—</span></td></tr>
<tr><td>Point 3</td><td>Point (X, Y)</td><td>100,100</td><td><span class="value-missing">—</span></td><td><span class="value-missing">—</span></td></tr>
<tr><td>Point 4</td><td>Point (X, Y)</td><td>-100,100</td><td><span class="value-missing">—</span></td><td><span class="value-missing">—</span></td></tr>
<tr><td>Closed</td><td>Toggle</td><td>true</td><td><span class="value-missing">—</span></td><td><span class="value-missing">—</span></td></tr>
</tbody>
</table>

**On-canvas handles:** 15 · Custom JavaScript path generation

---

## Rectangle

> A rectangle with adjustable width and height.

<div class="shape-preview">
  <img src="/shapes/rect.svg" alt="Rectangle preview" />
</div>

<table>
<thead><tr><th>Parameter</th><th>Type</th><th>Default</th><th>Min</th><th>Max</th></tr></thead>
<tbody>
<tr><td>Size</td><td>Point (X, Y)</td><td>100,100</td><td><span class="value-missing">—</span></td><td><span class="value-missing">—</span></td></tr>
</tbody>
</table>

**On-canvas handles:** 8 · Custom JavaScript path generation

---

## Rounded Rectangle

> A rounded rectangle with corner radius control.

<div class="shape-preview">
  <img src="/shapes/roundrect.svg" alt="Rounded Rectangle preview" />
</div>

<table>
<thead><tr><th>Parameter</th><th>Type</th><th>Default</th><th>Min</th><th>Max</th></tr></thead>
<tbody>
<tr><td>Size</td><td>Point (X, Y)</td><td>100,100</td><td><span class="value-missing">—</span></td><td><span class="value-missing">—</span></td></tr>
<tr><td>Radius</td><td>Number</td><td>25</td><td>0</td><td>2000</td></tr>
</tbody>
</table>

**On-canvas handles:** 9 · Custom JavaScript path generation

---

## Stamp

> A multi-purpose stamp shape with configurable lobes and indentation.

<div class="shape-preview">
  <img src="/shapes/stamp.svg" alt="Stamp preview" />
</div>

<table>
<thead><tr><th>Parameter</th><th>Type</th><th>Default</th><th>Min</th><th>Max</th></tr></thead>
<tbody>
<tr><td>Size</td><td>Point (X, Y)</td><td>150,150</td><td><span class="value-missing">—</span></td><td><span class="value-missing">—</span></td></tr>
<tr><td>Radius</td><td>Number</td><td>5</td><td>0</td><td>2000</td></tr>
<tr><td>Perforation Size</td><td>Number</td><td>40</td><td>0</td><td>500</td></tr>
<tr><td>Spacing</td><td>Number</td><td>20</td><td>0</td><td>500</td></tr>
</tbody>
</table>

**On-canvas handles:** 5 · Custom JavaScript path generation

---

## Star

> A star shape with configurable point count and inner/outer radius.

<div class="shape-preview">
  <img src="/shapes/star.svg" alt="Star preview" />
</div>

<table>
<thead><tr><th>Parameter</th><th>Type</th><th>Default</th><th>Min</th><th>Max</th></tr></thead>
<tbody>
<tr><td>Points</td><td>Slider</td><td>5</td><td>3</td><td>32</td></tr>
<tr><td>Outer Radius</td><td>Number</td><td>100</td><td>0</td><td>2000</td></tr>
<tr><td>Inner Radius</td><td>Number</td><td>50</td><td>0</td><td>2000</td></tr>
<tr><td>Angle</td><td>Number</td><td>0</td><td>-3600</td><td>3600</td></tr>
</tbody>
</table>

**On-canvas handles:** 3 · Custom JavaScript path generation

---

## Teardrop

> A teardrop / droplet shape.

<div class="shape-preview">
  <img src="/shapes/teardrop.svg" alt="Teardrop preview" />
</div>

<table>
<thead><tr><th>Parameter</th><th>Type</th><th>Default</th><th>Min</th><th>Max</th></tr></thead>
<tbody>
<tr><td>Radius</td><td>Number</td><td>100</td><td>0</td><td>2000</td></tr>
<tr><td>Tail</td><td>Number</td><td>200</td><td>0</td><td>5000</td></tr>
<tr><td>Squeeze</td><td>Number</td><td>2.5</td><td>1</td><td>10</td></tr>
<tr><td>Width</td><td>Number</td><td>0</td><td>0</td><td>100</td></tr>
</tbody>
</table>

**On-canvas handles:** 2 · Custom JavaScript path generation

---

## testshape

> A simple test shape for debugging.

<div class="shape-preview">
  <img src="/shapes/testshape.svg" alt="testshape preview" />
</div>

<table>
<thead><tr><th>Parameter</th><th>Type</th><th>Default</th><th>Min</th><th>Max</th></tr></thead>
<tbody>
<tr><td>Size</td><td>Point (X, Y)</td><td>100,100</td><td><span class="value-missing">—</span></td><td><span class="value-missing">—</span></td></tr>
<tr><td>TEST</td><td>Toggle</td><td>false</td><td><span class="value-missing">—</span></td><td><span class="value-missing">—</span></td></tr>
</tbody>
</table>

**On-canvas handles:** 1 · Custom JavaScript path generation

---

## Triangle

> An equilateral triangle.

<div class="shape-preview">
  <img src="/shapes/triangle.svg" alt="Triangle preview" />
</div>

<table>
<thead><tr><th>Parameter</th><th>Type</th><th>Default</th><th>Min</th><th>Max</th></tr></thead>
<tbody>
<tr><td>Point 1</td><td>Point (X, Y)</td><td>-100,100</td><td><span class="value-missing">—</span></td><td><span class="value-missing">—</span></td></tr>
<tr><td>Point 2</td><td>Point (X, Y)</td><td>0,-100</td><td><span class="value-missing">—</span></td><td><span class="value-missing">—</span></td></tr>
<tr><td>Point 3</td><td>Point (X, Y)</td><td>100,100</td><td><span class="value-missing">—</span></td><td><span class="value-missing">—</span></td></tr>
<tr><td>Closed</td><td>Toggle</td><td>true</td><td><span class="value-missing">—</span></td><td><span class="value-missing">—</span></td></tr>
</tbody>
</table>

**On-canvas handles:** 3 · Custom JavaScript path generation

---

## Wide Line

> A wide rectangular line / bar.

<div class="shape-preview">
  <img src="/shapes/wideline.svg" alt="Wide Line preview" />
</div>

<table>
<thead><tr><th>Parameter</th><th>Type</th><th>Default</th><th>Min</th><th>Max</th></tr></thead>
<tbody>
<tr><td>Start</td><td>Point (X, Y)</td><td>0,0</td><td><span class="value-missing">—</span></td><td><span class="value-missing">—</span></td></tr>
<tr><td>End</td><td>Point (X, Y)</td><td>250,-250</td><td><span class="value-missing">—</span></td><td><span class="value-missing">—</span></td></tr>
<tr><td>Width</td><td>Number</td><td>40</td><td>0</td><td>2000</td></tr>
</tbody>
</table>

**On-canvas handles:** 4 · Custom JavaScript path generation

---
