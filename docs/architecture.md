# Architecture

## Core pipeline

```text
GraphInput
    ↓ validate and normalize
NormalizedGraph
    ↓ layout adapter
Scene
    ↓ renderers
Accessible SVG / portable HTML artifact
```

`GraphInput` is the public, JSON-compatible authoring contract.
`NormalizedGraph` is an immutable internal/publicly readable representation in
which defaults and generated identities have been resolved. `Scene` adds only
derived geometry and retains a reference to normalized semantic entities.

The initial layout implementation translates `NormalizedGraph` into a private
ELK layered graph, then converts the result into renderer-independent scene
nodes, edges, groups, and points. Nested ELK coordinates are flattened into
absolute scene coordinates; renderers never consume ELK objects.

## Architectural invariants

1. Semantic nodes do not contain coordinates or dimensions.
2. Rendering styles do not appear in graph data.
3. Unknown semantic types remain valid and render generically.
4. Layout engines remain replaceable implementation details.
5. Entity identity, metadata, and provenance survive every stage.
6. Rendering never reconstructs meaning from geometry.
7. Orbweaver core has no dependency on RECALL or a UI framework.
8. Portable artifacts embed normalized semantics; their runtime never derives
   meaning from SVG geometry.

## Package scope

The initial package owns graph modeling, validation, normalization, layout,
scene construction, SVG rendering, accessibility helpers, and small interaction
primitives. Consuming systems own domain adapters and inspector experiences.

## AI-assisted proposal boundary

AI-assisted systems sit before the core pipeline:

```text
Untrusted GraphProposal
    ↓ proposal limits and diagnostics
Validated proposal
    ↓ explicit human or host acceptance
GraphInput
    ↓ ordinary Orbweaver pipeline
SVG
```

The proposal envelope carries generation metadata, supporting evidence, and AI
inferences for review. It does not replace `GraphInput`, and it cannot bypass
graph validation. Provider authentication, retrieval, prompting, cost controls,
and retention belong to consuming applications or optional adapters.

See [AI-assisted semantic visualization](ai-assisted-semantic-visualization.md)
and [ADR 0004](adr/0004-ai-proposes-semantics.md).

The architectural boundaries in this document are applied through the
[design and engineering discipline](design-discipline.md), which defines the
decision tests for scope, dependencies, interaction, accessibility, and
release quality.
