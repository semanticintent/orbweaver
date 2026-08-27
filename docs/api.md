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

## AI-assisted proposals

### `validateGraphProposal(input, options?)`

Accepts `unknown` untrusted input and returns path-specific proposal
diagnostics:

```ts
const result = validateGraphProposal(untrustedJson, {
  limits: { maxNodes: 100, maxEdges: 200 },
})

if (result.valid) {
  const acceptedGraph = result.proposal.graph
}
```

Validation checks the versioned envelope, graph structure, evidence and claim
references, ordinary graph invariants, executable markup, forbidden geometry
and renderer fields, and configurable resource limits. A valid result means the
proposal conforms to the contract; it does not establish that AI-generated
claims are factually true.

The accepted proposal is returned only when no errors remain. Warnings preserve
ordinary graph diagnostics such as disconnected nodes.

### `graphProposalJsonSchema`

The provider-neutral JSON Schema for `GraphProposal` version `1`. It can be
used as a structured-output schema or serialized for external validators.

### `defaultProposalValidationLimits`

The default limits are 1 MiB, 250 nodes, 500 edges, 50 groups, 500 evidence
references, 1,000 claims, 200-character labels, 2,000-character descriptions,
and eight metadata levels. Pass a partial `limits` object to lower or
explicitly adjust them.

Proposal types include `GraphProposal`, `ProposalGeneration`,
`EvidenceReference`, `ProposalClaim`, `ProposalValidationIssue`, and
`ProposalValidationResult`.

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
`responsive`, `includeSummary`, and an optional `frame` for portable artifacts.

The frame adds visible title and description content above the unchanged scene
and explicit artifact metadata below it. It also serializes the same metadata
into the SVG. Dates are never inferred, preserving deterministic output.

```ts
const svg = renderSvg(scene, {
  theme: darkTheme,
  responsive: false,
  frame: {
    version: '1.0',
    asOf: '2026-08-27',
    renderer: 'Orbweaver 0.2.0-alpha.2',
  },
})
```

`frame.title` and `frame.description` override the visible and accessible
artifact copy; otherwise the graph title and description are used. `version`
describes the represented system or schema, `asOf` describes when its
information was valid, `generatedAt` records an explicitly supplied render
time, and `renderer` identifies the producing implementation.

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

### `mountSvgViewport(svg, options?)`

Adds dependency-free, bounded SVG navigation without changing rendered
geometry. The returned controller exposes `zoomIn`, `zoomOut`, `setZoom`,
`fit`, `destroy`, `zoom`, and `state`.

Options configure `minZoom` (default `1`), `maxZoom` (default `4`),
`zoomStep` (default `1.25`), and an `onViewChange` callback. Normal wheel
scrolling is preserved; modified-wheel, keyboard, pointer, and pinch gestures
operate only on the root SVG `viewBox`.

## Errors

- `OrbweaverError`
- `GraphValidationError`
- `LayoutError`

No third-party layout types appear in public signatures.
