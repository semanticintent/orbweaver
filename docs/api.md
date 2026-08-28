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

### Semantic annotations

`Graph.annotations` adds structured meaning to a graph, node, edge, or group
without introducing authored geometry. An annotation contains an `id`, `body`,
optional `label`, semantic `type`, `severity`, provenance, and target.

```ts
annotations: [{
  id: 'payment-timeout-risk',
  target: { kind: 'node', id: 'authorize-payment' },
  type: 'risk',
  severity: 'warning',
  label: 'Timeout risk',
  body: 'Authorization can time out before the provider confirms state.',
  source: { file: 'fulfillment.rcl', line: 84 },
}]
```

Built-in annotation kinds are `note`, `constraint`, `risk`, `decision`,
`evidence`, `assumption`, and `change`. Severity is `info`, `warning`, or
`critical`. Custom type strings remain valid and receive the neutral marker.
Orbweaver derives marker symbols, count aggregation, severity treatment, and
placement; annotation data never contains visual coordinates.

### `getAnnotations(graph, target?)`

Returns annotations for a graph or exact semantic entity target in graph order.
Omitting `target` returns graph-level annotations.

## Semantic lenses

### `deriveLensProjection(normalizedGraph, lens)`

Derives an ordered, explainable reading of a graph without changing its
semantics or geometry. Every node, edge, and group receives one role:
`match`, `context`, or `background`. Direct matches include semantic reasons;
context identifies supporting endpoints, relationships, members, or groups.

```ts
const graph = normalizeGraph(input)
const lens = getSemanticLensRecipe('risk')
const projection = deriveLensProjection(graph, lens)

for (const match of projection.matches) {
  if (match.role === 'match') console.log(match.entity, match.reasons)
}
```

Lens rules may match entity kind, semantic type, status, source presence,
top-level metadata, or targeted annotation type, severity, and metadata. Rules
contain semantic predicates and explanation text—not colors, opacity,
coordinates, CSS, SVG, callbacks, or executable regular expressions.

### Built-in recipes

`getSemanticLensRecipe(id)` returns one of six built-in recipes:

- `risk`
- `trust`
- `data-flow`
- `provenance`
- `ownership`
- `modernization`

`semanticLensRecipes` exposes the same recipes as a keyed collection. Recipes
recognize only declared graph meaning; they do not infer architectural truth.

### `getLensMatch(projection, ref)`

Returns the projection entry for an exact node, edge, or group reference.

## Semantic detail

### `recommendSemanticDetailLevel(zoom, thresholds?)`

Returns an explicit `overview`, `standard`, or `close` recommendation from a
positive zoom value. Defaults are renderer-owned: overview below `1.2`,
standard from `1.2` through values below `2`, and close at `2` or above.

```ts
const detailLevel = recommendSemanticDetailLevel(viewport.zoom)
const svg = renderSvg(scene, { detailLevel })
```

Hosts may override `overviewBelow` and `closeAt`, provided both are positive
and `closeAt` is greater. `defaultSemanticDetailThresholds` exposes the stable
defaults. The helper does not observe browser state or mutate a viewport; it
only translates an explicit scale into deterministic semantic presentation.

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

The default limits are 1 MiB, 250 nodes, 500 edges, 50 groups, 500 annotations,
500 evidence references, 1,000 claims, 200-character labels, 2,000-character
descriptions, and eight metadata levels. Pass a partial `limits` object to
lower or explicitly adjust them.

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
`responsive`, `includeSummary`, an optional `frame` for portable artifacts, an
optional semantic `lens`, and an explicit `detailLevel`.

The frame adds visible title and description content above the unchanged scene
and explicit artifact metadata below it. It also serializes the same metadata
into the SVG. Dates are never inferred, preserving deterministic output.

```ts
const svg = renderSvg(scene, {
  theme: darkTheme,
  lens: getSemanticLensRecipe('risk'),
  detailLevel: 'close',
  responsive: false,
  frame: {
    version: '1.0',
    asOf: '2026-08-27',
    renderer: 'Orbweaver 0.2.0-alpha.2',
  },
})
```

The default `standard` level preserves the established rendering. `overview`
keeps entity identity, topology, groups, hit targets, and critical annotation
signals while suppressing secondary type and relationship copy. `close`
reveals bounded node and group descriptions plus relationship type context.
All three levels share the same scene bounds, routes, semantic IDs, accessible
entity descriptions, and interaction contract. A level is recorded in SVG
metadata and `data-detail-level`, making static exports deterministic and
auditable.

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

### `inspectEntity(normalizedGraph, ref, lensProjection?)`

Returns a semantic `Inspection` for a node, edge, or group. Inspection can
include metadata, provenance, endpoints, neighbor IDs, relationship IDs, or
recursive group membership. Targeted semantic annotations are included in
graph order so an inspector can present their complete labels, bodies,
severity, metadata, and provenance.

When a lens projection is supplied, inspection also reports the entity role and
the semantic reasons that produced it.

### `mountSvgInteraction(svg, normalizedGraph, options?)`

Attaches framework-independent pointer and keyboard selection behavior to a
rendered SVG. It returns a controller with `select`, `clear`, `destroy`, and
`selected`.

Pass the corresponding `lensProjection` in the interaction options when the
SVG was rendered with a lens. Pointer and keyboard selection will then return
the same explainable lens context through `onSelectionChange`.

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
