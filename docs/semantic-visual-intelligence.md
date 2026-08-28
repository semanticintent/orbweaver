# Semantic visual intelligence

**Status:** Scoped for phased implementation

## Purpose

Orbweaver should become visually richer by understanding more, not by asking
authors to decorate more. This program introduces derived ways to read a graph
while preserving the existing boundary:

> Authors declare meaning. Orbweaver owns geometry and visual treatment.

The work proceeds in five ordered capabilities:

1. semantic lenses;
2. semantic level of detail;
3. focused path narratives;
4. generated legends; and
5. architecture comparison.

Each capability must remain useful in an ordinary static artifact, accessible
without color or motion, deterministic for equivalent inputs, and optional for
consumers that need only the current renderer.

## Architectural invariants

- Graphs never contain coordinates, style tokens, visibility breakpoints, or
  animation instructions.
- A derived view never mutates the graph or changes semantic identity.
- Emphasis must be explainable as entity references and semantic reasons.
- Presentation state must not alter layout geometry unless a future contract
  explicitly establishes a separate, deterministic layout mode.
- Essential meaning survives without hover, pointer input, color, or motion.
- Interactive behavior has an equivalent explicit state for static export.
- The core remains framework-independent and adds no visualization dependency.
- Hosts retain ownership of toolbars, inspector composition, and persistence.

## Pipeline boundary

```text
Accepted semantic graph
        ↓
Normalized semantic index
        ↓
Derived view projection
  matches · context · reasons
        ↓
Existing scene geometry
        ↓
SVG treatment and accessibility
```

A view projection is semantic data about how to read the current graph. It is
not a second graph and does not contain colors, opacity, coordinates, CSS, or
SVG. Rendering maps projection roles to theme-owned visual tokens.

## 1. Semantic lenses

**Implementation status:** Complete in `0.2.0-alpha.6` and adopted by the public
package-native gallery.

### Reader problem

Large diagrams often answer several questions at once. A reader needs to
examine risk, ownership, trust, data flow, provenance, or modernization without
losing the surrounding architecture.

### Scope

A lens applies declarative semantic match rules to nodes, edges, groups, and
annotations. Core derives three ordered roles:

- `match` — directly satisfies the lens;
- `context` — required to understand a match, such as its owning group or one
  relationship hop; and
- `background` — remains visible but visually recedes.

Every match includes one or more machine-readable reasons. Inspection can
therefore answer “why is this emphasized?” without reconstructing meaning from
the SVG.

Initial built-in lens recipes:

| Lens | Derived from |
| --- | --- |
| Risk | warning/critical status and risk annotations |
| Trust | constraint annotations, external entities, and boundary relationships |
| Data flow | data/event relationships and their endpoint entities |
| Provenance | source references, evidence annotations, evidence, and claims |
| Ownership | ownership annotations and declared ownership metadata |
| Modernization | change/risk annotations and lifecycle metadata |

Recipes are conveniences over a public semantic rule contract. They do not add
new graph vocabulary or silently infer business truth.

### Proposed API shape

```ts
interface SemanticLens {
  id: string
  label: string
  rules: SemanticLensRule[]
  context?: { relationshipHops?: 0 | 1 | 2; includeGroups?: boolean }
}

interface LensMatch {
  entity: EntityRef
  role: 'match' | 'context' | 'background'
  reasons: LensReason[]
}

deriveLensProjection(graph, lens): LensProjection
```

Rules match semantic fields and exact metadata values. They never contain
functions, regular-expression source from untrusted proposals, visual tokens,
or geometry.

### Acceptance gate

- Equivalent graph and lens inputs produce an equivalent ordered projection.
- Every emphasized entity has at least one semantic reason.
- Nodes, edges, and groups support lens selection and keyboard inspection.
- The renderer changes treatment without changing scene bounds or routes.
- Accessible summaries name the active lens and match count.
- Static SVG can render an explicitly selected lens.
- Risk and trust lenses work across dependency, process, and enterprise
  architecture fixtures.

## 2. Semantic level of detail

**Implementation status:** Complete in `0.2.0-alpha.7` and adopted by the public
package-native gallery.

### Reader problem

Dense diagrams need to remain calm at overview scale and informative at close
scale. Shrinking every label equally produces clutter rather than comprehension.

### Scope

Orbweaver defines three deterministic detail levels:

- `overview` — groups, major entity identity, topology, and critical signals;
- `standard` — current default labels, relationship labels, and markers; and
- `close` — descriptions and a bounded set of derived semantic details.

The viewport controller may recommend a level from zoom, but rendering accepts
an explicit level so tests and exports never depend on ambient browser state.
Level changes reveal content inside existing geometry; they do not trigger
relayout or author-controlled breakpoints.

The implemented API accepts `detailLevel` in SVG render options and exports
`recommendSemanticDetailLevel(zoom, thresholds?)` for hosts that want a stable
viewport recommendation. Defaults select overview below `1.2`, standard from
`1.2` through values below `2`, and close at `2` or above. Static exports choose
a level explicitly and never depend on ambient browser zoom.

Disclosure is deliberately bounded:

| Level | Visible treatment |
| --- | --- |
| Overview | Entity identity, group boundaries, topology, and critical annotation markers |
| Standard | Established node types, relationship labels, and all annotation markers |
| Close | Bounded node/group descriptions and relationship type context |

All underlying entities and annotation meaning remain in accessible SVG text
at every level. Semantic lenses and detail levels compose as independent
readings over the same scene.

### Acceptance gate

- [x] Thresholds and disclosed fields are renderer-owned and documented.
- [x] No entity disappears completely solely because it is not selected.
- [x] Detail transitions preserve selection, focus, hit targets, and scene geometry.
- [x] Reduced-motion mode uses immediate changes; animation is never required.
- [x] Static SVG export accepts an explicit detail level.
- Long-label and dense-graph fixtures remain legible at all three levels.

## 3. Focused path narratives

**Implementation status:** Complete in `0.2.0-alpha.8` and adopted by the public
package-native gallery.

### Reader problem

A selected entity is more useful when a reader can follow its upstream causes,
downstream effects, data lineage, failure propagation, or trust crossings.

### Scope

Path narratives compose existing semantic graph queries into a stable ordered
result containing entities, relationships, direction, and a textual summary.
Initial narrative recipes:

- upstream dependencies;
- downstream impact;
- data lineage;
- failure propagation; and
- trust-boundary crossings.

Rendering emphasizes the selected path and retains the rest as context. A
subtle one-time directional reveal may be evaluated only after the static and
reduced-motion behavior is complete.

The implemented projection uses a breadth-first traversal in normalized graph
order. Each step records depth, relationship identity, semantic direction,
traversal orientation, and a recipe-owned explanation. `maxDepth` and
`maxSteps` provide explicit resource bounds; truncation is returned as data and
included in the textual summary.

Built-in recipes cover upstream dependencies, downstream impact, data/event
lineage, declared failure relationships, and declared trust boundaries or
external endpoints. They only follow authored semantics. Rendering adds an
explicit start, ordered path emphasis, accessible metadata, and inspection
context without changing the scene.

### Acceptance gate

- [x] Cycles, disconnected graphs, self-edges, and bounded traversal are tested.
- [x] Results have deterministic ordering and explicit truncation diagnostics.
- [x] Keyboard users can enter, advance through, and leave a narrative.
- [x] Text summaries communicate order and direction without relying on animation.
- [x] Selection and narrative emphasis compose without ambiguous states.

## 4. Generated legends

**Implementation status:** Complete in `0.2.0-alpha.9` and adopted by the public
package-native gallery.

### Reader problem

Published artifacts should explain the visual vocabulary they actually use
without requiring a separately maintained legend.

### Scope

Core derives a legend model from the normalized graph, theme vocabulary, active
lens, annotation categories, statuses, and relationship types present in the
artifact. The host or renderer decides where to present it.

Empty categories are omitted. Legend ordering is stable. Authors may choose
whether a legend is included, but may not override individual symbols or
colors.

The implemented legend model contains stable sections and counted items. It
derives entity types, group types, relationship types, non-default statuses,
annotation kinds, and any active lens, detail, or focused-path state. Custom
vocabulary remains plain semantic text; no presentation tokens enter the model.

`includeLegend: true` appends a compact renderer-owned key outside unchanged
scene geometry. The same summary is embedded in SVG accessibility text and
metadata. Artifact frames, focused paths, lenses, and semantic detail compose
without requiring separately maintained legend content.

### Acceptance gate

- [x] The legend model contains only semantics present in the rendered artifact.
- [x] Symbols and text remain meaningful without color.
- [x] SVG export can embed an optional deterministic legend.
- [x] Legends remain compact for graphs with custom entity and relationship types.
- [x] Active lens and detail level are identified when applicable.

## 5. Architecture comparison

**Implementation status:** Complete in `0.2.0-alpha.10` and adopted by the public
gallery.

### Reader problem

Architecture reviews need to explain what is retained, introduced, retired, or
changed between two semantic states without manually duplicating and coloring
diagrams.

### Scope

Comparison accepts two validated graphs and matches stable semantic IDs. It
derives:

- unchanged entities and relationships;
- introduced entities and relationships;
- removed entities and relationships;
- changed semantic fields; and
- unresolved references or incompatible identities.

The comparison result is an inspectable semantic diff, not a merged source of
truth. The initial renderer may use an overlay or side-by-side host composition
only after the diff model is stable. Animation and timeline editing are out of
scope.

The implemented comparison matches stable node, edge, and group IDs and
classifies target-first entries as unchanged, introduced, changed, or removed.
Changed entries contain explicit before/after values for semantic fields and
targeted annotations. Removed entries preserve the complete prior semantic
entity and its annotations. Renames are never inferred.

The initial SVG treatment renders the target scene: unchanged meaning recedes,
introduced and changed meaning receive distinct non-color-only treatments, and
accessible labels name every state. Removed semantics remain in the comparison
summary and embedded metadata because placing them onto target geometry would
violate the authored-meaning/derived-geometry boundary.

### Acceptance gate

- [x] Diff ordering is deterministic and field changes are inspectable.
- [x] Renames are not guessed; they require stable identity or an explicit mapping.
- [x] Removed entities retain enough semantic data for accessible inspection.
- [x] Static output distinguishes states without depending on color.
- [x] Current/target architecture fixtures demonstrate the result.

## Delivery sequence and dependencies

```text
Semantic lenses
      ↓ shared projection roles and reasons
Semantic level of detail
      ↓ explicit view state
Focused path narratives
      ↓ reusable emphasis composition
Generated legends
      ↓ self-explaining artifacts
Architecture comparison
```

Each step ships as a complete vertical slice across types, derivation, scene or
renderer integration, interaction where applicable, accessibility, fixtures,
documentation, and package validation. Later steps may reuse earlier view
projection primitives but may not broaden their contracts speculatively.

## Performance and package budget

- Projection derivation should remain linear in graph entities plus traversed
  relationships for built-in recipes.
- Lens switching and detail changes reuse existing scene geometry.
- No new runtime dependency is planned.
- Representative benchmarks must include the Northwind, enterprise
  architecture, cyclic, and dense fixtures.
- Bundle and interaction budgets are recorded before the first public release
  of the program.

## Explicit non-goals

- authored colors, icons, gradients, opacity, or per-entity styling;
- manual coordinates, drag-to-position, or freeform canvas editing;
- vendor-cloud icon catalogs or architecture-framework lock-in;
- hidden AI inference that assigns risk, ownership, or trust as fact;
- hover-only meaning, continuous decorative animation, or forced transitions;
- a repository, governance workflow, portfolio database, or collaboration
  service; and
- replacing full enterprise architecture suites.

## Program gate

The program is complete when a large semantic architecture can be read through
multiple explainable lenses, progressively inspected, followed as bounded
paths, exported with its own legend, and compared with another version—without
authored geometry or styling, loss of semantic identity, inaccessible meaning,
or a material increase in conceptual weight for basic consumers.
