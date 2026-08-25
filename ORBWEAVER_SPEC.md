# Orbweaver

> Semantic visual structures for declarative systems.

**Status:** Prototype specification  
**Target:** v0.1 architectural proof  
**Primary implementation language:** TypeScript  
**Initial render target:** SVG in HTML  
**Initial consumers:** standalone examples first; RECALL adapter later

---

## 1. Summary

Orbweaver is a semantic visualization runtime for rendering structured relationships as inspectable, source-aware visual structures.

The core principle is:

> **Authors declare meaning. Orbweaver owns geometry.**

Orbweaver is not intended to be a drawing canvas, a manual vector editor, or a replacement for general-purpose diagramming tools. It is a programmatic visualization substrate that accepts a semantic graph, applies a layout strategy, and renders an accessible visual representation.

A caller should describe concepts such as:

- this is a process,
- this depends on that,
- this node belongs to this group,
- this event precedes that event,
- this relationship represents data flow,
- this node is a decision,
- this object came from this source.

The caller should not normally describe:

- pixel coordinates,
- SVG paths,
- stroke colors,
- element widths,
- Bézier control points,
- manual routing.

Orbweaver turns semantic structure into visual structure.

---

## 2. Why the name “Orbweaver”

Orb-weaver spiders construct webs that are not merely static objects. The web is simultaneously:

- a structure,
- a network,
- a routing surface,
- a sensing surface,
- a way of localizing activity,
- a system of relationships between anchors and a central hub.

That makes the metaphor useful for Orbweaver:

```text
semantic entities
      │
      ▼
relationships
      │
      ▼
topology
      │
      ▼
visual structure
      │
      ▼
interaction / inspection
```

The metaphor should influence the product philosophy, not leak excessively into the public API.

Use professional terms in code:

- graph
- node
- edge
- group
- annotation
- layout
- renderer

Avoid overly cute terminology such as `strand`, `silk`, or `prey` in the public API.

Possible tagline:

> **Orbweaver — semantic visual structures for RECALL.**

Broader standalone tagline:

> **Orbweaver — semantic visual structures for declarative systems.**

---

## 3. Design philosophy

### 3.1 Meaning before appearance

A graph should express what entities are and how they relate.

Bad:

```ts
{
  x: 140,
  y: 280,
  width: 180,
  fill: "#22d3ee"
}
```

Preferred:

```ts
{
  id: "payments",
  type: "service",
  label: "Payments",
  status: "critical"
}
```

The renderer and theme determine the visual treatment.

---

### 3.2 Geometry is derived

Node placement, edge routing, grouping boundaries, spacing, and responsive behavior should be derived from semantic structure and layout configuration.

Manual coordinate overrides may exist much later as an escape hatch, but they are explicitly not part of v0.1.

---

### 3.3 Semantic types are open-ended

Orbweaver should not hard-code one taxonomy of node and edge types.

A graph may use:

```text
process
decision
service
database
actor
queue
document
external-system
event
```

or domain-specific types:

```text
claim
evidence
policy
risk
constraint
hypothesis
```

Orbweaver should carry these semantic values without requiring core changes.

Themes and renderers may map known types to visual treatments.

Unknown types must still render gracefully.

---

### 3.4 Rendering is downstream of the model

The semantic graph is the stable contract.

```text
Domain Model
    ↓
Orbweaver Graph
    ↓
Layout
    ↓
Scene
    ↓
Renderer
```

Rendering concerns must not contaminate domain data.

---

### 3.5 Provenance is first-class

Visual objects should be able to retain information about where they came from.

A node can optionally point to:

- source file,
- line or range,
- record identifier,
- field path,
- URI,
- artifact identifier,
- arbitrary source metadata.

This enables source-linked visuals later.

---

### 3.6 Accessibility is part of the architecture

A graph must not exist only as pixels or SVG geometry.

The semantic graph should make it possible to expose:

- text summaries,
- keyboard navigation,
- node descriptions,
- relationship descriptions,
- ordered traversal,
- accessible SVG labels.

Accessibility should not require reconstructing meaning from SVG after rendering.

---

## 4. Non-goals for v0.1

Orbweaver v0.1 will **not** attempt to provide:

- freeform drawing,
- drag-anything canvas editing,
- collaborative whiteboarding,
- UML compliance,
- BPMN compliance,
- Mermaid syntax compatibility,
- Graphviz DOT compatibility,
- sequence-diagram-specific syntax,
- manual route editing,
- arbitrary vector artwork,
- image editing,
- slide authoring,
- dashboards,
- charting,
- persistence/database infrastructure,
- cloud collaboration,
- its own RECALL language syntax.

These may be evaluated later.

---

## 5. Architectural boundaries

Orbweaver v0.1 should be usable without RECALL.

Recommended package boundary:

```text
@semanticintent/orbweaver
```

Future optional integration:

```text
@semanticintent/orbweaver-recall
```

or an adapter inside the RECALL ecosystem.

Orbweaver core should know nothing about:

- RECALL divisions,
- RECALL DISPLAY syntax,
- `.rcpy`,
- compiler internals,
- StratIQX,
- domain-specific analysis frameworks.

That separation is intentional.

---

## 6. Core pipeline

```text
                 ┌───────────────────┐
                 │ Application data  │
                 └─────────┬─────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │ Orbweaver Graph   │
                 │ semantic model    │
                 └─────────┬─────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │ Layout Adapter    │
                 │ geometry only     │
                 └─────────┬─────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │ Scene Model       │
                 │ positioned graph  │
                 └─────────┬─────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │ SVG Renderer      │
                 └─────────┬─────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │ HTML artifact     │
                 │ + interaction     │
                 └───────────────────┘
```

The semantic model and positioned scene should be separate data structures.

---

## 7. Package structure

Initial proposal:

```text
orbweaver/
├── package.json
├── tsconfig.json
├── README.md
├── SPEC.md
├── src/
│   ├── index.ts
│   ├── model/
│   │   ├── graph.ts
│   │   ├── node.ts
│   │   ├── edge.ts
│   │   ├── group.ts
│   │   ├── annotation.ts
│   │   ├── provenance.ts
│   │   └── validation.ts
│   ├── scene/
│   │   ├── scene.ts
│   │   ├── scene-node.ts
│   │   ├── scene-edge.ts
│   │   └── geometry.ts
│   ├── layout/
│   │   ├── layout.ts
│   │   ├── hierarchical.ts
│   │   └── adapter.ts
│   ├── render/
│   │   ├── svg.ts
│   │   ├── html.ts
│   │   └── accessibility.ts
│   ├── interaction/
│   │   ├── selection.ts
│   │   ├── focus.ts
│   │   └── inspect.ts
│   └── theme/
│       ├── theme.ts
│       └── default-theme.ts
├── examples/
│   ├── basic-flow/
│   ├── decision-flow/
│   ├── dependency-map/
│   └── architecture-flow/
└── tests/
    ├── model.test.ts
    ├── validation.test.ts
    ├── layout.test.ts
    └── render.test.ts
```

Avoid over-modularization at the beginning. Merge files where useful during implementation.

---

# 8. Semantic graph model

## 8.1 Graph

Proposed interface:

```ts
export interface Graph {
  id: string;
  title?: string;
  description?: string;

  nodes: Node[];
  edges: Edge[];

  groups?: Group[];
  annotations?: Annotation[];

  metadata?: Record<string, unknown>;

  options?: GraphOptions;
}
```

Possible graph options:

```ts
export interface GraphOptions {
  directed?: boolean;
  layout?: LayoutPreference;
}
```

---

## 8.2 Node

```ts
export interface Node {
  id: string;

  type?: string;
  label: string;
  description?: string;

  group?: string;
  layer?: string;

  status?: string;
  value?: string | number;

  metadata?: Record<string, unknown>;
  source?: Provenance;
}
```

### Required behavior

- `id` must be unique within a graph.
- `label` is human-facing.
- `type` is semantic and open-ended.
- unknown `type` values must render.
- `metadata` must be preserved through layout/rendering.
- `source` must survive through the full pipeline.

---

## 8.3 Edge

```ts
export interface Edge {
  id?: string;

  from: string;
  to: string;

  type?: string;
  label?: string;

  direction?: "forward" | "backward" | "both" | "none";

  metadata?: Record<string, unknown>;
  source?: Provenance;
}
```

Default direction should inherit from the graph.

Edge identity should be normalized internally if no explicit ID is supplied.

Example generated ID:

```text
edge:checkout->payment:dependency:0
```

---

## 8.4 Group

```ts
export interface Group {
  id: string;
  label: string;
  description?: string;

  parent?: string;

  type?: string;
  metadata?: Record<string, unknown>;
  source?: Provenance;
}
```

Groups represent semantic containment.

Examples:

- frontend
- backend
- data layer
- external systems
- business unit
- trust boundary

A group is not merely a visual rectangle.

---

## 8.5 Annotation

```ts
export interface Annotation {
  id: string;
  target?: {
    kind: "graph" | "node" | "edge" | "group";
    id?: string;
  };

  label?: string;
  body: string;

  type?: string;
  metadata?: Record<string, unknown>;
  source?: Provenance;
}
```

Annotations support notes, warnings, explanatory text, and later evidence/citations.

---

## 8.6 Provenance

```ts
export interface Provenance {
  uri?: string;
  file?: string;

  line?: number;
  column?: number;

  endLine?: number;
  endColumn?: number;

  path?: string;
  recordId?: string;
  artifactId?: string;

  metadata?: Record<string, unknown>;
}
```

No assumptions should be made about source format.

A later RECALL adapter can populate provenance from compiler source metadata.

---

# 9. Validation

Provide:

```ts
validateGraph(graph): ValidationResult
```

Possible result:

```ts
interface ValidationResult {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}
```

Validation rules for v0.1:

### Errors

- duplicate node ID,
- edge references missing source node,
- edge references missing target node,
- duplicate group ID,
- node references nonexistent group,
- group parent cycle,
- empty node ID,
- empty graph ID.

### Warnings

- disconnected node,
- self-edge,
- duplicate semantically identical edge,
- empty label,
- empty group,
- unsupported preferred layout.

Rendering should fail for structural errors and continue for warnings.

---

# 10. Layout system

## 10.1 Layout contract

```ts
export interface LayoutEngine {
  readonly id: string;

  layout(
    graph: Graph,
    options?: LayoutOptions
  ): Promise<Scene> | Scene;
}
```

Layout transforms semantic topology into geometry.

It must not modify the input graph.

---

## 10.2 Scene model

Example:

```ts
export interface Scene {
  width: number;
  height: number;

  nodes: SceneNode[];
  edges: SceneEdge[];
  groups: SceneGroup[];

  graph: Graph;
}
```

Scene node:

```ts
export interface SceneNode {
  nodeId: string;

  x: number;
  y: number;

  width: number;
  height: number;
}
```

Scene edge:

```ts
export interface Point {
  x: number;
  y: number;
}

export interface SceneEdge {
  edgeId: string;
  points: Point[];
}
```

Geometry belongs here, not in the semantic graph.

---

# 11. Initial layout strategy

## Hierarchical flow

v0.1 requires one production-quality hierarchical layout supporting:

```text
LR  left → right
RL  right → left
TB  top → bottom
BT  bottom → top
```

Most prototype examples should use LR or TB.

### Layout engine dependency

Do **not** build hierarchical graph layout from scratch unless clearly justified.

Evaluate established engines such as:

- ELK / elkjs
- Dagre
- Graphviz WASM where appropriate

Orbweaver must wrap the engine behind its own `LayoutEngine` interface.

No third-party layout types should leak into the Orbweaver semantic API.

Concept:

```text
Graph
  │
  ▼
Orbweaver Layout Adapter
  │
  ▼
ELK / Dagre / other
  │
  ▼
raw geometry
  │
  ▼
Orbweaver Scene
```

### Selection criteria

Prefer an engine with:

- deterministic output,
- hierarchical layouts,
- edge routing,
- group support or reasonable future path,
- browser compatibility,
- TypeScript friendliness,
- active maintenance,
- acceptable bundle size,
- permissive license.

Document the choice in an ADR.

---

# 12. Node sizing

Node size should be renderer/theme derived.

v0.1 may use pragmatic estimated text measurement.

Default conceptual sizes:

```text
min width: 140
max width: 260
min height: 56
```

Labels should wrap.

The architecture must leave room for actual SVG text measurement later.

---

# 13. Rendering

## 13.1 First renderer: SVG

SVG is the required v0.1 rendering target.

Reasons:

- semantic DOM,
- accessible labeling,
- crisp scaling,
- CSS theme integration,
- event targeting,
- easy embedding in HTML,
- static export potential,
- source-linked element attributes.

Canvas may be evaluated later for very large graphs.

---

## 13.2 Renderer contract

```ts
export interface Renderer<TOutput> {
  render(
    scene: Scene,
    options?: RenderOptions
  ): TOutput;
}
```

Initial:

```ts
SvgRenderer implements Renderer<string>
```

may return an SVG string.

Optionally provide a DOM renderer later.

---

## 13.3 SVG structure

Suggested output:

```html
<svg
  class="orbweaver"
  viewBox="0 0 1200 640"
  role="img"
  aria-labelledby="ow-title ow-desc"
>
  <title id="ow-title">Order processing flow</title>
  <desc id="ow-desc">...</desc>

  <g class="ow-groups"></g>
  <g class="ow-edges"></g>
  <g class="ow-nodes"></g>
  <g class="ow-annotations"></g>
</svg>
```

Edges should render before nodes unless another layering scheme is required.

---

# 14. Semantic rendering

Node semantic type should produce classes/data attributes:

```html
<g
  class="ow-node"
  data-node-id="database"
  data-node-type="database"
  data-node-status="healthy"
>
```

Do not hard-code business concepts into CSS.

Theme selectors may choose treatments:

```css
.ow-node[data-node-type="decision"] { ... }
```

Unknown types use the generic node appearance.

---

# 15. Basic node visual vocabulary

v0.1 renderer should support a restrained set of semantic visual hints.

Suggested defaults:

| Type | Default treatment |
|---|---|
| generic | rounded rectangle |
| process | rounded rectangle |
| decision | diamond-like or differentiated decision node |
| service | rounded rectangle with semantic marker |
| database | datastore treatment |
| actor | simple actor/person treatment or card |
| external | dashed/secondary boundary treatment |
| queue | queue-like treatment |
| document | document treatment |

These are renderer defaults, not graph semantics.

Avoid introducing icon libraries in the first implementation unless necessary.

---

# 16. Edge rendering

Edges should support:

- directed arrow,
- undirected line,
- bidirectional edge,
- semantic type,
- optional label.

Default route comes from layout scene points.

Potential semantic treatments:

```text
flow
dependency
data
event
reference
error
recovery
```

Again, unknown types render generically.

---

# 17. Theme system

Proposed theme interface:

```ts
export interface OrbweaverTheme {
  id: string;

  node?: NodeTheme;
  edge?: EdgeTheme;
  group?: GroupTheme;
  annotation?: AnnotationTheme;

  semantic?: {
    nodeTypes?: Record<string, Partial<NodeTheme>>;
    edgeTypes?: Record<string, Partial<EdgeTheme>>;
    statuses?: Record<string, Partial<NodeTheme>>;
  };
}
```

Prefer CSS variables where possible.

Suggested variables:

```css
--ow-font-family
--ow-font-size

--ow-node-bg
--ow-node-border
--ow-node-text
--ow-node-muted

--ow-edge
--ow-edge-label

--ow-group-bg
--ow-group-border
--ow-group-label

--ow-focus
--ow-selection
--ow-muted-opacity
```

A future RECALL integration can map these to RECALL theme variables.

---

# 18. Interaction

v0.1 should support a small interaction model.

## Hover

Hover may temporarily emphasize immediate neighbors.

Hover must not be required to access essential information.

---

## Select

Click/tap a node or edge to select it.

Selection should persist until:

- another entity is selected,
- the background is clicked,
- Escape is pressed.

---

## Focus

When an entity is selected:

- connected nodes/edges remain prominent,
- unrelated content may be visually muted.

This is optional behind a renderer setting.

---

## Inspect

Selected elements may expose a basic inspector object:

```ts
interface Inspection {
  kind: "node" | "edge" | "group";
  id: string;
  label?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  source?: Provenance;
}
```

The core library should expose selection/inspection events.

It should not prescribe a full inspector UI.

---

# 19. Accessibility

Required in v0.1:

- SVG `<title>` and `<desc>`,
- node accessible names,
- keyboard-focusable nodes where practical,
- meaningful DOM order,
- visible focus indicator,
- non-color-only status distinction where possible,
- textual graph summary helper.

Suggested API:

```ts
summarizeGraph(graph): string
```

Example:

```text
Order Processing. Five nodes and five directed relationships.
Customer flows to Checkout.
Checkout flows to Validate Payment.
Validate Payment branches to Fulfillment or Payment Error.
```

The summary does not need sophisticated NLP.

---

# 20. Responsive behavior

The SVG should:

- use `viewBox`,
- scale to available width,
- preserve aspect ratio,
- avoid hardcoded page widths.

For large diagrams, a later HTML wrapper may support:

- pan,
- zoom,
- fit-to-view.

v0.1 may initially provide responsive scaling only, with optional fit controls if straightforward.

---

# 21. First prototype diagrams

The prototype must intentionally use **ordinary diagrams**, not StratIQX.

This tests whether Orbweaver is truly general.

---

## 21.1 Example A — Basic flow

Semantic graph:

```text
Start
  ↓
Receive Request
  ↓
Validate
  ↓
Process
  ↓
Complete
```

TypeScript:

```ts
const graph: Graph = {
  id: "basic-flow",
  title: "Basic Request Flow",

  nodes: [
    { id: "start", type: "event", label: "Start" },
    { id: "receive", type: "process", label: "Receive Request" },
    { id: "validate", type: "process", label: "Validate" },
    { id: "process", type: "process", label: "Process" },
    { id: "complete", type: "event", label: "Complete" }
  ],

  edges: [
    { from: "start", to: "receive", type: "flow" },
    { from: "receive", to: "validate", type: "flow" },
    { from: "validate", to: "process", type: "flow" },
    { from: "process", to: "complete", type: "flow" }
  ]
};
```

Purpose:

- prove basic layout,
- prove deterministic ordering,
- prove node sizing,
- prove SVG rendering.

---

## 21.2 Example B — Decision flow

```text
             ┌───────────────┐
             │ Receive Order │
             └───────┬───────┘
                     ▼
                ◇ In stock?
                /         \
              yes          no
              /             \
             ▼               ▼
       Reserve Item      Backorder
             │               │
             └──────┬────────┘
                    ▼
               Notify User
```

Graph:

```ts
const graph: Graph = {
  id: "decision-flow",
  title: "Order Decision",

  nodes: [
    { id: "receive", type: "process", label: "Receive Order" },
    { id: "stock", type: "decision", label: "In Stock?" },
    { id: "reserve", type: "process", label: "Reserve Item" },
    { id: "backorder", type: "process", label: "Backorder" },
    { id: "notify", type: "process", label: "Notify User" }
  ],

  edges: [
    { from: "receive", to: "stock", type: "flow" },
    { from: "stock", to: "reserve", type: "flow", label: "Yes" },
    { from: "stock", to: "backorder", type: "flow", label: "No" },
    { from: "reserve", to: "notify", type: "flow" },
    { from: "backorder", to: "notify", type: "flow" }
  ]
};
```

Purpose:

- branching,
- edge labels,
- merge,
- decision semantics.

---

## 21.3 Example C — Dependency map

```text
Web App
  │
  ├──→ Auth Service ───→ User DB
  │
  └──→ API ────────────→ Primary DB
              │
              └────────→ Queue ─→ Worker
```

Node types:

```text
application
service
database
queue
worker
```

Edge type:

```text
dependency
```

Purpose:

- non-linear graph,
- semantic node types,
- dependency focus,
- inspect behavior.

---

## 21.4 Example D — Simple architecture

Groups:

```text
CLIENT
  Browser

APPLICATION
  API
  Auth
  Worker

DATA
  Database
  Queue

EXTERNAL
  Email Provider
```

Relationships:

```text
Browser → API
API → Auth
API → Database
API → Queue
Queue → Worker
Worker → Email Provider
```

Purpose:

- group semantics,
- nested visual structure,
- architecture readability,
- external boundary.

If groups substantially complicate v0.1 layout, implement this example after the first three and document the limitation rather than hacking around it.

---

# 22. Prototype demo page

Create an example site:

```text
examples/index.html
```

or a Vite-powered demo.

The page should show:

- diagram title,
- diagram itself,
- a selector for the four examples,
- selected entity details,
- raw semantic graph JSON in a collapsible panel,
- textual accessibility summary.

Do not make this a polished product UI.

The purpose is architectural validation.

---

# 23. Suggested public API

Desired developer experience:

```ts
import {
  createGraph,
  layoutGraph,
  renderSvg
} from "@semanticintent/orbweaver";

const graph = createGraph({
  id: "example",
  nodes: [...],
  edges: [...]
});

const scene = await layoutGraph(graph, {
  engine: "hierarchical",
  direction: "LR"
});

const svg = renderSvg(scene);
```

Convenience API may also exist:

```ts
const svg = await renderGraph(graph, {
  layout: {
    engine: "hierarchical",
    direction: "LR"
  }
});
```

Keep the lower-level pipeline exposed.

---

# 24. API design rule

Do not return third-party layout objects from public APIs.

Bad:

```ts
const elkGraph: ElkNode = ...
```

Preferred:

```ts
const scene: Scene = ...
```

Third-party dependencies must remain implementation details.

---

# 25. JSON compatibility

The graph model should be plain-data serializable.

This should work:

```ts
JSON.stringify(graph)
```

and:

```ts
const graph = JSON.parse(json)
validateGraph(graph)
```

Do not require class instances for model entities.

This is important for eventual:

```text
JSON
 ↓
Orbweaver
```

and:

```text
RECALL DATA
 ↓
adapter
 ↓
Orbweaver Graph
```

---

# 26. Determinism

Given:

- identical graph input,
- identical layout options,
- identical Orbweaver version,
- identical layout engine version,

the resulting scene should be deterministic where the underlying engine permits it.

This matters for:

- testing,
- source-controlled artifacts,
- publishing,
- screenshots,
- future RECALL integration.

Add deterministic snapshot tests.

---

# 27. Serialization

Optional v0.1 helpers:

```ts
serializeGraph(graph): string
parseGraph(json): Graph
```

These are convenience wrappers only.

No proprietary Orbweaver diagram language is needed.

---

# 28. Error handling

Use explicit Orbweaver errors.

Suggested hierarchy:

```ts
OrbweaverError
GraphValidationError
LayoutError
RenderError
```

Error messages should include entity IDs where possible.

Example:

```text
GraphValidationError:
Edge "checkout-payment" references missing node "payment".
```

---

# 29. Testing strategy

## Unit tests

Test:

- graph validation,
- duplicate IDs,
- dangling edges,
- group validation,
- source preservation,
- semantic metadata preservation,
- deterministic edge IDs.

---

## Layout tests

Use small fixtures.

Assert:

- all nodes have finite coordinates,
- no negative dimensions,
- scene bounds contain nodes,
- deterministic snapshots,
- direction changes produce expected ordering.

Avoid pixel-perfect assertions where engine versions may produce minor shifts.

---

## Renderer tests

Assert:

- valid SVG root,
- node IDs represented,
- edge IDs represented,
- ARIA metadata present,
- labels escaped safely,
- malicious HTML in labels does not become executable markup,
- provenance metadata does not break output.

---

## Integration tests

For each example:

```text
Graph
 → validate
 → layout
 → scene
 → SVG
```

must complete successfully.

Store representative SVG snapshots if practical.

---

# 30. Security

Treat all labels, metadata, descriptions, and source fields as untrusted.

SVG renderer must escape text.

Do not inject arbitrary graph metadata into raw HTML.

If metadata is written to `data-*` attributes, escape safely.

No `foreignObject` in v0.1 unless clearly necessary.

Avoid embedded user-provided HTML.

---

# 31. Performance

v0.1 target:

```text
comfortable: 1–100 nodes
reasonable: 100–500 nodes
not optimized: 500+
```

Do not prematurely optimize for massive graphs.

Measure before introducing canvas virtualization or Web Workers.

---

# 32. Possible dependency decisions

Likely categories:

### Build

- TypeScript
- Vitest
- Vite for demo only

### Layout

Evaluate:

- elkjs
- dagre

Do not add both unless comparison code is isolated.

### DOM/SVG

Prefer native APIs/string rendering initially.

Avoid a React dependency in Orbweaver core.

Framework adapters can come later.

---

# 33. Framework stance

Orbweaver core should be framework-independent.

Potential future packages:

```text
@semanticintent/orbweaver
@semanticintent/orbweaver-react
@semanticintent/orbweaver-recall
```

Do not make React required for v0.1.

---

# 34. RECALL integration — deferred

RECALL is intentionally not part of the first implementation milestone.

Later architecture:

```text
RECALL DATA
    │
    ▼
RECALL component
    │
    ▼
Orbweaver adapter
    │
    ▼
Orbweaver Graph
    │
    ▼
layout + render
```

A future component might expose:

```text
DISPLAY FLOW-DIAGRAM USING FLOW-DATA.
```

The RECALL caller should never need to know about layout coordinates or SVG.

---

# 35. Future source-linked visuals

Because provenance is present in the model, a future compiled artifact could support:

```text
click node
   ↓
inspect
   ├── description
   ├── relationships
   ├── metadata
   └── source
```

Source could lead to:

- embedded source,
- file/line,
- editor jump,
- repository URL,
- document section.

This capability should influence v0.1 data modeling even though the full source inspector is not required yet.

---

# 36. Future graph operations

Not v0.1, but preserve architectural room for:

```text
neighbors(node)
upstream(node)
downstream(node)
shortestPath(a, b)
connectedComponent(node)
filterByType(type)
filterByStatus(status)
collapseGroup(group)
expandGroup(group)
```

Semantic diagrams become especially valuable when the visual can be interrogated rather than merely viewed.

---

# 37. Future layouts

Potential additions:

```text
radial
force
timeline
swimlane
sequence
grid
matrix
tree
```

Each must implement the same `LayoutEngine` interface.

---

# 38. Future renderers

Potential:

```text
SVG
HTML/SVG interactive
static SVG
PNG export
PDF-compatible SVG
Canvas
```

Semantic model must remain independent.

---

# 39. Future authoring UI

A future visual authoring tool could create graph data rather than becoming the source of truth.

Desired model:

```text
visual editor
     ↓
semantic graph
     ↓
serialized source/data
```

rather than:

```text
canvas coordinates
     ↓
opaque proprietary document
```

Any future editor should preserve Orbweaver’s declarative philosophy.

---

# 40. Implementation milestones

## Milestone 0 — Repository scaffold

Deliver:

- TypeScript package,
- tests,
- formatter/linter,
- build,
- README,
- SPEC.

Acceptance:

```bash
npm install
npm test
npm run build
```

all succeed.

---

## Milestone 1 — Semantic graph

Implement:

- Graph
- Node
- Edge
- Group
- Annotation
- Provenance
- validation

Acceptance:

- fixtures validate,
- malformed graphs produce useful errors,
- JSON round-trip works.

---

## Milestone 2 — Hierarchical layout

Implement one adapter.

Acceptance:

- basic flow positions correctly,
- decision flow branches correctly,
- direction LR/TB supported,
- deterministic fixture snapshots.

---

## Milestone 3 — SVG renderer

Implement:

- generic nodes,
- decision nodes,
- edges,
- arrows,
- edge labels,
- graph title/description,
- accessibility metadata.

Acceptance:

- examples produce readable SVG,
- no manual coordinates in example graph data.

---

## Milestone 4 — Interaction

Add:

- hover emphasis,
- click selection,
- focus,
- inspection callback,
- keyboard focus basics.

Acceptance:

- user can select a node by mouse and keyboard,
- connected relationships can be identified,
- metadata/source survives inspection.

---

## Milestone 5 — Dependency example

Prove semantic node/edge types.

Acceptance:

- dependency map uses the same graph/layout/renderer pipeline,
- no special dependency-diagram renderer required.

---

## Milestone 6 — Grouped architecture example

Add groups if layout engine support is solid.

Acceptance:

- application/data/external groups render clearly,
- group membership remains semantic.

If group routing becomes a major architectural complication, document it and defer rather than compromising the model.

---

# 41. Definition of v0.1 success

Orbweaver v0.1 succeeds if all of the following are true:

1. Four ordinary diagram examples can be represented using the same semantic graph model.
2. Example graph data contains no manual node coordinates.
3. A third-party layout engine can be swapped without changing graph definitions.
4. SVG rendering does not depend on RECALL.
5. Node and edge semantic metadata survive graph → scene → render.
6. Provenance survives the same pipeline.
7. Selection can return the original semantic entity.
8. The output is accessible enough to expose meaningful labels and a textual summary.
9. The architecture is clean enough for a later RECALL adapter without changing Orbweaver core.
10. The implementation remains small enough to understand.

---

# 42. Definition of failure

Reconsider the architecture if:

- domain callers must supply geometry,
- every diagram category requires a separate renderer,
- the semantic graph accumulates CSS/SVG fields,
- a third-party layout library becomes the public data model,
- RECALL-specific concepts appear in Orbweaver core,
- rendering requires reconstructing semantics from SVG,
- the demo needs large amounts of diagram-specific branching,
- new diagrams require changing the Graph interface repeatedly.

---

# 43. Architectural decision records

Create:

```text
docs/adr/
```

Suggested first ADRs:

```text
0001-semantic-graph-as-public-contract.md
0002-svg-first-renderer.md
0003-layout-engine-selection.md
0004-framework-independent-core.md
0005-provenance-first-class.md
```

Keep ADRs short.

---

# 44. Documentation requirements

README should contain:

1. one-paragraph purpose,
2. installation,
3. smallest possible example,
4. architecture diagram,
5. design principles,
6. link to SPEC,
7. non-goals,
8. development commands.

Avoid marketing-heavy language until architecture is proven.

---

# 45. Example minimal README API

```ts
import {
  createGraph,
  renderGraph
} from "@semanticintent/orbweaver";

const graph = createGraph({
  id: "hello",
  nodes: [
    { id: "author", type: "actor", label: "Author" },
    { id: "compiler", type: "process", label: "Compiler" },
    { id: "artifact", type: "document", label: "Artifact" }
  ],
  edges: [
    { from: "author", to: "compiler", type: "flow" },
    { from: "compiler", to: "artifact", type: "flow" }
  ]
});

const svg = await renderGraph(graph, {
  layout: {
    engine: "hierarchical",
    direction: "LR"
  }
});
```

Expected visual concept:

```text
Author  ─────→  Compiler  ─────→  Artifact
```

---

# 46. Codex implementation instructions

When handing this repository/spec to a coding agent, use incremental implementation rather than asking for the entire project in one unconstrained generation.

Recommended phases:

### Phase A

> Read SPEC.md completely. Do not implement yet. Inspect the repository and propose the smallest architecture that satisfies Milestones 0–3. Identify unresolved decisions, especially layout engine selection. Do not add RECALL integration.

### Phase B

> Implement Milestones 0 and 1 only. Add tests. Run tests and build. Do not implement rendering or layout yet.

### Phase C

> Evaluate elkjs versus dagre against SPEC.md. Choose one and record the decision in ADR 0003. Implement Milestone 2 behind the Orbweaver LayoutEngine interface. Add tests.

### Phase D

> Implement the SVG renderer from Milestone 3. Keep all geometry out of semantic graph types. Add the basic-flow and decision-flow examples and snapshot/integration tests.

### Phase E

> Add dependency-map and simple-architecture examples. Add selection/inspection only after the static rendering pipeline is stable.

This staged approach makes architecture mistakes visible early.

---

# 47. Instructions to coding agents

The following constraints are mandatory:

1. Read the entire spec before implementation.
2. Do not invent new RECALL syntax.
3. Do not introduce RECALL as a dependency.
4. Do not introduce StratIQX concepts.
5. Do not place x/y coordinates on semantic nodes.
6. Do not expose ELK/Dagre types through public Orbweaver APIs.
7. Do not add React to core.
8. Do not implement a freeform editor.
9. Keep semantic `type` values open-ended.
10. Preserve provenance through every transformation.
11. Prefer boring, explicit TypeScript over heavy abstraction.
12. Write tests for architectural invariants.
13. Keep dependencies minimal.
14. Document meaningful architectural deviations in ADRs.
15. If a requirement is ambiguous, favor separation of semantics, geometry, and rendering.

---

# 48. Open questions

These should be answered by implementation experience rather than speculation where possible.

### Layout engine

ELK or Dagre?

### Node measurement

Approximation or DOM/SVG measurement pass?

### Renderer architecture

String renderer, DOM renderer, or both?

### Group support

Required in initial release or v0.2?

### Interaction ownership

Core state machine versus renderer helper?

### Edge semantics

Should `direction` default entirely from graph options?

### Theme delivery

TypeScript theme object, CSS variables, or hybrid?

### Source metadata

Which provenance fields should be standardized versus arbitrary metadata?

---

# 49. Suggested initial answers

For the prototype:

```text
Layout engine        evaluate ELK first
Node measurement     deterministic approximation
Renderer             SVG string + optional DOM mount helper
Groups               attempt after core examples
Interaction          thin renderer helper
Edge direction       graph default, edge override
Themes               CSS variables + small TS defaults
Provenance           small standard object + metadata bag
```

These are defaults, not immutable decisions.

---

# 50. Guiding principles

When implementation choices become unclear, use these tests.

### Test 1

Does this field describe **meaning** or **appearance**?

If appearance, it probably does not belong in `Graph`.

### Test 2

Would changing SVG to Canvas require changing the semantic model?

If yes, the abstraction is leaking.

### Test 3

Would changing ELK to another layout engine require changing caller graph data?

If yes, the abstraction is leaking.

### Test 4

Can an unknown node type still render?

If no, semantic typing is too closed.

### Test 5

Can the original entity be recovered after layout and render?

If no, provenance/identity has been lost.

### Test 6

Could a future RECALL component generate this graph without caring about geometry?

If no, Orbweaver is too low-level.

---

# 51. Product identity

Working name:

# Orbweaver

Working descriptor:

> Semantic visual structures for declarative systems.

Possible RECALL-specific descriptor later:

> Semantic visual structures for RECALL.

Possible README statement:

> Orbweaver converts semantic graphs into source-aware visual structures. Callers declare entities and relationships; layout engines derive geometry; renderers produce accessible visual artifacts.

---

# 52. One-sentence architecture

> **Orbweaver is a framework-independent semantic graph model with pluggable layout and rendering, designed so declarative systems can produce inspectable diagrams without becoming drawing programs.**

---

# 53. The rule to protect above all others

> **Authors declare meaning. Orbweaver owns geometry.**

If the implementation remains faithful to that sentence, the project is probably headed in the right direction.
