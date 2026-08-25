# Public API

Orbweaver exposes a lower-level pipeline and a convenience rendering API. All
semantic model values are plain JSON-compatible data.

## Graph construction

### `createGraph(input)`

Creates a defensive structured clone of graph input. It does not validate,
normalize, lay out, or mutate the caller's value.

### `validateGraph(graph)`

Returns `{ valid, errors, warnings }`. Structural errors prevent normalization
and rendering. Warnings identify conditions such as disconnected nodes without
making the graph invalid.

### `normalizeGraph(graph)`

Validates and returns a `NormalizedGraph` with explicit graph defaults, stable
edge IDs, and normalized edge direction. Throws `GraphValidationError` for
structural errors.

## Layout

### `layoutGraph(graph, options?)`

Runs hierarchical layout and returns a renderer-independent `Scene`.

```ts
const scene = await layoutGraph(graph, {
  direction: 'LR',
  spacing: 44,
  layerSpacing: 82,
  padding: 32,
})
```

Supported directions are `LR`, `RL`, `TB`, and `BT`. The default engine is
`ElkLayoutEngine`; consumers may provide another `LayoutEngine` implementation.

### `estimateNodeSize(node)`

Returns the deterministic size estimate used by the initial layout adapter.

## Rendering

### `renderSvg(scene, options?)`

Returns an accessible SVG string. Options include `theme`, `className`,
`responsive`, and `includeSummary`.

### `renderGraph(graph, options?)`

Convenience composition of `layoutGraph` and `renderSvg`.

```ts
const svg = await renderGraph(graph, {
  layout: { direction: 'TB' },
  render: { theme: darkTheme },
})
```

### Themes

`lightTheme` and `darkTheme` are complete `OrbweaverTheme` values. A custom
theme can replace their presentation tokens without modifying graph data.

## Semantic queries

- `getIncomingEdges(graph, nodeId)`
- `getOutgoingEdges(graph, nodeId)`
- `getIncidentEdges(graph, nodeId)`
- `getNeighbors(graph, nodeId)`
- `getGroupNodes(graph, groupId, recursive?)`
- `summarizeGraph(graph)`

Query results preserve graph order and return semantic entities, not scene or
DOM objects.

## Inspection and interaction

### `inspectEntity(normalizedGraph, ref)`

Returns a semantic `Inspection` for a node, edge, or group. Inspection can
include metadata, provenance, endpoints, neighbor IDs, relationship IDs, or
recursive group membership.

### `mountSvgInteraction(svg, normalizedGraph, options?)`

Attaches framework-independent pointer and keyboard selection behavior to a
rendered SVG. It returns a controller with `select`, `clear`, `destroy`, and
`selected`.

Call `destroy()` before the host permanently removes the diagram.

## Errors

- `OrbweaverError`
- `GraphValidationError`
- `LayoutError`

No third-party layout types appear in public signatures.
