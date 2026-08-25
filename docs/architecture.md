# Architecture

## Core pipeline

```text
GraphInput
    ↓ validate and normalize
NormalizedGraph
    ↓ layout adapter
Scene
    ↓ renderer
SVG
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

## Package scope

The initial package owns graph modeling, validation, normalization, layout,
scene construction, SVG rendering, accessibility helpers, and small interaction
primitives. Consuming systems own domain adapters and inspector experiences.
