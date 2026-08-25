# Orbweaver ↔ RECALL Integration Architecture

> How the Orbweaver semantic visualization core integrates with RECALL's component and plugin system.

**Status:** Architecture draft  
**Companion:** `ORBWEAVER_SPEC.md`  
**Scope:** Integration contract only — Orbweaver core remains independent of RECALL.

---

# 1. Purpose

Orbweaver and RECALL solve different problems.

**RECALL** is the declarative authoring and publishing environment. It owns author intent, structured DATA, reusable components, plugins, themes, compilation, and the final artifact.

**Orbweaver** is a semantic visualization runtime. It owns graph semantics, derived geometry, layout, visual rendering, interaction primitives, and preservation of provenance through the visualization pipeline.

The integration should preserve both systems' boundaries.

The central rule is:

> **RECALL components own the authoring contract. Orbweaver owns visualization mechanics.**

A RECALL author should not need to learn Orbweaver's internal scene model, SVG geometry, layout engine API, or routing implementation.

Orbweaver should not need to understand RECALL syntax, divisions, copybooks, compiler internals, or application-specific component contracts.

---

# 2. Architectural overview

```text
┌─────────────────────────────────────────────┐
│                RECALL SOURCE                │
│                                             │
│ DATA DIVISION                               │
│ COMPONENT DIVISION                          │
│ PROCEDURE DIVISION                          │
└─────────────────────┬───────────────────────┘
                      │
                      │ DISPLAY ... USING ...
                      ▼
┌─────────────────────────────────────────────┐
│          RECALL COMPONENT / PLUGIN          │
│                                             │
│ - ACCEPTS contract                          │
│ - validates component input                 │
│ - interprets domain semantics               │
│ - maps RECALL data → Orbweaver Graph        │
│ - supplies theme context                    │
│ - supplies source provenance                │
└─────────────────────┬───────────────────────┘
                      │
                      │ Graph
                      ▼
┌─────────────────────────────────────────────┐
│              ORBWEAVER CORE                 │
│                                             │
│ semantic graph                              │
│      ↓                                      │
│ validation                                  │
│      ↓                                      │
│ layout adapter                              │
│      ↓                                      │
│ positioned scene                            │
│      ↓                                      │
│ SVG / HTML rendering                        │
│      ↓                                      │
│ interaction metadata                        │
└─────────────────────┬───────────────────────┘
                      │
                      │ rendered fragment
                      ▼
┌─────────────────────────────────────────────┐
│              RECALL COMPILER                │
│                                             │
│ combines visual fragment with document      │
│ components, theme, styles, source metadata, │
│ and artifact infrastructure                 │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│          SELF-CONTAINED ARTIFACT            │
│                                             │
│ prose + tables + components + diagrams      │
│ + interactions + embedded source/provenance │
└─────────────────────────────────────────────┘
```

The key architectural boundary is the conversion from a RECALL component's accepted data into an Orbweaver `Graph`.

---

# 3. Why Orbweaver is not part of the RECALL compiler core

Orbweaver should initially remain an independent package:

```text
@semanticintent/orbweaver
```

RECALL integration should consume Orbweaver rather than merge Orbweaver into the compiler.

This provides several benefits.

## 3.1 Independent evolution

Orbweaver can improve:

- graph validation,
- layout,
- routing,
- SVG rendering,
- interaction,
- accessibility,

without requiring RECALL language changes.

## 3.2 Independent testing

Orbweaver can be tested with ordinary TypeScript graph fixtures without compiling RECALL programs.

## 3.3 Reusability

Orbweaver could eventually be consumed by:

- RECALL,
- standalone TypeScript applications,
- documentation systems,
- development tools,
- a future visual authoring environment,
- static-site generators.

## 3.4 Cleaner compiler architecture

The RECALL compiler does not need to become a graph-layout engine.

It only needs a plugin/component integration point capable of invoking Orbweaver.

---

# 4. Package layering

A likely ecosystem structure is:

```text
@semanticintent/orbweaver
│
│  framework-independent visualization core
│
├── semantic graph model
├── validation
├── layout abstraction
├── scene model
├── SVG renderer
├── interaction primitives
└── provenance model


@semanticintent/recall-diagrams
│
│  RECALL-facing component/plugin package
│
├── components/
│   ├── flow.rcpy
│   ├── decision-flow.rcpy
│   ├── dependency-map.rcpy
│   └── architecture-map.rcpy
│
├── plugin/
│   ├── graph-adapter.ts
│   ├── renderer.ts
│   ├── provenance.ts
│   └── theme-adapter.ts
│
└── themes/
```

A separate package such as:

```text
@semanticintent/orbweaver-recall
```

may eventually make sense if multiple RECALL component libraries need the same adapter infrastructure.

Do **not** create that package prematurely.

Start with the integration adapter inside `recall-diagrams`.

Extract it only after a second independent RECALL plugin demonstrates reuse.

---

# 5. Responsibilities

## 5.1 RECALL owns

RECALL should own:

- author-facing syntax,
- DATA declarations,
- component contracts,
- `ACCEPTS`,
- `DISPLAY`,
- `USING` / `WITH DATA`,
- component discovery,
- plugin loading,
- theme selection,
- compilation,
- artifact composition,
- embedded source,
- source-to-artifact relationship.

## 5.2 RECALL diagram components own

A RECALL diagram component should own:

- the data contract expected from authors,
- interpretation of that data,
- defaults meaningful to that diagram,
- transformation into an Orbweaver graph,
- mapping RECALL theme values into Orbweaver presentation tokens,
- attaching RECALL provenance where available.

Examples:

```text
FLOW-DIAGRAM
DEPENDENCY-MAP
ARCHITECTURE-MAP
DECISION-FLOW
```

## 5.3 Orbweaver owns

Orbweaver should own:

- generic graph representation,
- nodes,
- edges,
- groups,
- annotations,
- semantic graph validation,
- layout,
- node placement,
- edge routing,
- positioned scene model,
- SVG generation,
- graph-level accessibility,
- selection primitives,
- graph inspection primitives,
- preservation of source metadata.

## 5.4 Layout engine owns

A third-party engine such as ELK may own:

- graph layout algorithms,
- routing calculations,
- rank/layer positioning,
- geometric optimization.

Its data model must remain private to Orbweaver.

## 5.5 Theme owns

Theme configuration owns visual choices such as:

- typography,
- node surfaces,
- borders,
- connector appearance,
- selection treatment,
- status treatments,
- spacing scale where appropriate.

The semantic graph must not own these choices.

---

# 6. Authoring experience

A RECALL author should experience diagrams as ordinary components.

Conceptually:

```text
DATA DIVISION.

01 FLOW-NODES.
   ...

01 FLOW-EDGES.
   ...

COMPONENT DIVISION.

COPY FROM
   "@semanticintent/recall-diagrams/components/flow.rcpy".

PROCEDURE DIVISION.

MAIN.
   DISPLAY FLOW-DIAGRAM
      USING FLOW-DATA.
```

The exact syntax should follow existing RECALL component conventions.

The important point is that the author does **not** write:

```text
x = 240
y = 180
width = 160
edge-path = "M..."
```

Nor should the author need to call Orbweaver directly.

---

# 7. The component is the semantic adapter

The RECALL component is more than a wrapper around SVG.

It translates an author-friendly contract into a generic semantic graph.

Example author data might conceptually represent:

```text
NODE A
   LABEL "Receive Request"
   TYPE PROCESS

NODE B
   LABEL "Validate"
   TYPE DECISION

NODE C
   LABEL "Process"
   TYPE PROCESS

EDGE A TO B
   TYPE FLOW

EDGE B TO C
   LABEL "Valid"
   TYPE FLOW
```

The component/plugin converts that into:

```ts
const graph: Graph = {
  id: "request-flow",

  nodes: [
    {
      id: "a",
      type: "process",
      label: "Receive Request"
    },
    {
      id: "b",
      type: "decision",
      label: "Validate"
    },
    {
      id: "c",
      type: "process",
      label: "Process"
    }
  ],

  edges: [
    {
      from: "a",
      to: "b",
      type: "flow"
    },
    {
      from: "b",
      to: "c",
      type: "flow",
      label: "Valid"
    }
  ]
};
```

From that point onward, Orbweaver owns the visualization pipeline.

---

# 8. Why the RECALL component contract should not equal the Orbweaver graph contract

It may be tempting to expose Orbweaver's `Graph` structure directly as the RECALL component contract.

Avoid making that the only model.

Different RECALL components may expose more natural authoring contracts.

For example:

## Generic flow component

```text
FLOW-NODES
FLOW-EDGES
FLOW-DIRECTION
```

## Architecture component

```text
SYSTEMS
DEPENDENCIES
BOUNDARIES
```

## Decision component

```text
STEPS
DECISIONS
OUTCOMES
TRANSITIONS
```

All three can eventually become:

```ts
Graph
```

This is valuable because:

> **The RECALL contract expresses author intent.  
> The Orbweaver graph expresses visualization semantics.**

They are related, but they are not necessarily identical.

---

# 9. Generic graph escape hatch

Although semantic components should be preferred, a lower-level generic graph component may be useful.

For example:

```text
DISPLAY GRAPH
   USING GRAPH-NODES,
         GRAPH-EDGES,
         GRAPH-GROUPS.
```

This would expose something close to the Orbweaver graph model.

Use cases:

- experimentation,
- generated data,
- AI-produced graphs,
- external JSON,
- unusual diagram types,
- prototyping new semantic components.

The generic graph component should be treated as an escape hatch, not the only authoring experience.

---

# 10. Data flow in detail

```text
RECALL DATA
    │
    │ component ACCEPTS contract
    ▼
Component Input
    │
    │ semantic mapping
    ▼
Orbweaver Graph
    │
    │ validateGraph()
    ▼
Validated Graph
    │
    │ layoutGraph()
    ▼
Orbweaver Scene
    │
    │ renderSvg()
    ▼
SVG Fragment
    │
    │ component renderer
    ▼
RECALL Render Fragment
    │
    │ compiler composition
    ▼
Final HTML Artifact
```

At every transformation, semantic identity must be preserved.

---

# 11. Identity preservation

Suppose RECALL input contains an entity:

```text
PAYMENT-SERVICE
```

The adapter creates:

```ts
{
  id: "payment-service",
  type: "service",
  label: "Payment Service"
}
```

After layout, Orbweaver might produce:

```ts
{
  nodeId: "payment-service",
  x: 420,
  y: 180,
  width: 180,
  height: 64
}
```

The SVG might contain:

```html
<g
  class="ow-node"
  data-node-id="payment-service"
  data-node-type="service"
>
```

The ID relationship must remain intact:

```text
RECALL entity
     ↕
Orbweaver Node
     ↕
Scene Node
     ↕
SVG element
```

This is what makes later inspection and source navigation possible.

---

# 12. Provenance bridge

Orbweaver defines a generic provenance structure.

Conceptually:

```ts
interface Provenance {
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

The RECALL integration layer is responsible for populating it.

Example:

```ts
{
  id: "payment-service",
  type: "service",
  label: "Payment Service",

  source: {
    file: "checkout.rc",
    line: 84,
    path: "PAYMENT-SERVICE",
    artifactId: "checkout"
  }
}
```

Orbweaver does not interpret `checkout.rc`.

It merely preserves the provenance.

---

# 13. Source-linked artifacts

RECALL's artifact model creates a particularly useful opportunity.

Conceptually:

```text
compiled artifact
│
├── rendered document
│   └── Orbweaver diagram
│       └── node: payment-service
│
└── embedded/original source
    └── PAYMENT-SERVICE definition
```

A future interaction could therefore be:

```text
select Payment Service
       ↓
Inspector
       │
       ├── Type: service
       ├── Relationships: 4
       ├── Metadata
       └── View Source
                ↓
        PAYMENT-SERVICE
```

This capability should be built from provenance rather than from diagram-specific hacks.

---

# 14. Provenance principle

> **Orbweaver preserves source identity; RECALL interprets source identity.**

This is an important boundary.

Orbweaver should never need code such as:

```ts
if (source.kind === "recall") ...
```

The RECALL adapter or artifact runtime owns that behavior.

---

# 15. Theme bridge

RECALL themes should remain the primary visual authority inside RECALL artifacts.

Orbweaver should expose neutral theme tokens, preferably through CSS variables.

Example Orbweaver variables:

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

--ow-selection
--ow-focus
```

The RECALL integration can map active theme variables:

```css
--ow-font-family: var(--font-body);
--ow-node-bg: var(--bg-card);
--ow-node-border: var(--border);
--ow-node-text: var(--text);
--ow-edge: var(--text-muted);
--ow-selection: var(--accent);
```

Exact RECALL variable names should follow the actual theme system.

---

# 16. Theme flow

```text
RECALL THEME
     │
     ▼
theme adapter
     │
     ▼
Orbweaver CSS variables
     │
     ▼
SVG / HTML visual
```

The graph itself remains unchanged.

Therefore the same semantic graph can render inside multiple RECALL themes without changing author data.

---

# 17. Semantic type versus visual treatment

A RECALL component may map domain concepts into semantic node types.

Example:

```ts
{
  type: "database"
}
```

Orbweaver may render that as a datastore-like node.

But the graph should not say:

```ts
{
  shape: "cylinder",
  fill: "#123456"
}
```

Likewise:

```ts
{
  type: "decision"
}
```

is semantic.

```ts
{
  polygonSides: 4,
  rotation: 45
}
```

is rendering detail.

The integration must preserve this distinction.

---

# 18. Plugin registration

The RECALL diagram package should use the existing RECALL plugin system.

Conceptually:

```text
RECALL compiler
     │
     ├── loads recall-diagrams plugin
     │
     ├── plugin registers component/render capability
     │
     └── DISPLAY invokes registered renderer
```

The exact registration API should use the compiler's current plugin mechanism rather than introducing an Orbweaver-specific plugin system.

Orbweaver itself should not register with RECALL.

The RECALL plugin registers.

---

# 19. Suggested `recall-diagrams` structure

```text
recall-diagrams/
├── package.json
├── README.md
├── components/
│   ├── flow.rcpy
│   ├── decision-flow.rcpy
│   ├── dependency-map.rcpy
│   ├── architecture-map.rcpy
│   └── graph.rcpy
├── src/
│   ├── plugin/
│   │   ├── index.ts
│   │   ├── register.ts
│   │   └── renderer.ts
│   ├── adapters/
│   │   ├── flow-adapter.ts
│   │   ├── decision-adapter.ts
│   │   ├── dependency-adapter.ts
│   │   ├── architecture-adapter.ts
│   │   ├── provenance-adapter.ts
│   │   └── theme-adapter.ts
│   └── runtime/
│       └── interaction.ts
└── themes/
```

This is illustrative rather than prescriptive.

---

# 20. Component adapter contract

A useful internal abstraction might be:

```ts
export interface RecallDiagramAdapter<TInput> {
  toGraph(
    input: TInput,
    context: RecallDiagramContext
  ): Graph;
}
```

Context:

```ts
export interface RecallDiagramContext {
  componentId?: string;
  artifactId?: string;

  theme?: unknown;

  source?: {
    file?: string;
    line?: number;
    path?: string;
  };

  metadata?: Record<string, unknown>;
}
```

Avoid importing RECALL compiler internals into Orbweaver.

This interface belongs in the integration package, not core.

---

# 21. Rendering bridge

A shared integration helper could conceptually perform:

```ts
async function renderRecallDiagram(
  graph: Graph,
  context: RecallRenderContext
): Promise<string> {
  const validation = validateGraph(graph);

  if (!validation.valid) {
    throw new RecallDiagramError(validation.errors);
  }

  const scene = await layoutGraph(graph, context.layout);

  return renderSvg(scene, {
    theme: context.orbweaverTheme,
    interactive: context.interactive
  });
}
```

This helper should remain thin.

Business/domain interpretation belongs in adapters.

Visualization mechanics belong in Orbweaver.

---

# 22. Error ownership

Errors should be reported at the correct layer.

## RECALL component errors

Examples:

```text
FLOW-DIAGRAM requires FLOW-NODES.
DEPENDENCY-MAP requires a SYSTEM-ID.
```

These are authoring-contract errors.

## Orbweaver graph errors

Examples:

```text
Edge "a-b" references missing node "b".
Duplicate node ID "api".
```

These are semantic graph errors.

## Layout errors

Examples:

```text
Hierarchical layout failed for graph "checkout".
```

These are Orbweaver/runtime errors.

The RECALL integration should translate lower-level errors into useful compiler diagnostics while preserving technical details where appropriate.

---

# 23. Compilation behavior

A diagram component should compile like any other RECALL component.

Conceptually:

```text
DISPLAY FLOW-DIAGRAM USING FLOW-DATA.
```

causes:

```text
1. resolve component
2. validate ACCEPTS contract
3. execute diagram adapter
4. produce Orbweaver Graph
5. validate graph
6. derive layout
7. render SVG
8. return HTML/SVG fragment
9. continue normal RECALL artifact compilation
```

The diagram should not require a separate build pipeline from the rest of the artifact.

---

# 24. Self-contained output

Where RECALL normally produces self-contained HTML, Orbweaver integration should preserve that property.

Prefer output containing:

- inline SVG,
- artifact CSS,
- minimal local interaction JavaScript where required.

Avoid requiring runtime calls to:

- external diagram servers,
- remote rendering APIs,
- CDN layout engines in the final artifact.

Layout should normally happen during compilation.

---

# 25. Compile-time versus runtime layout

Default:

> **Layout occurs at compile time.**

This means:

```text
semantic graph
     ↓
compiler/plugin
     ↓
layout
     ↓
SVG geometry
     ↓
artifact
```

Benefits:

- deterministic publishing,
- self-contained artifacts,
- no browser layout-engine dependency,
- faster artifact load,
- static export compatibility.

Runtime behavior should be limited to interaction where possible:

- selection,
- focus,
- inspect,
- collapse/expand later,
- zoom/pan later.

---

# 26. When runtime layout may be justified

Future cases may require browser-side layout:

- dynamic filtering,
- graph mutation,
- user-created nodes,
- expand/collapse that changes topology,
- live data.

That should be an explicit future mode, not the v0.1 default.

---

# 27. Interaction integration

Orbweaver should expose stable semantic identifiers in the rendered output.

The RECALL artifact runtime may then attach behavior.

Example:

```html
<g
  class="ow-node"
  data-node-id="payment"
  tabindex="0"
>
```

RECALL or the diagram plugin can provide an inspector panel.

The inspector can retrieve the semantic entity associated with `payment`.

---

# 28. Interaction ownership rule

> **Orbweaver defines interaction primitives; the consuming environment owns interaction experience.**

Orbweaver can support:

- selected entity,
- focused entity,
- neighbor discovery,
- inspection payload.

RECALL can decide:

- where an inspector appears,
- how source is shown,
- whether evidence opens inline,
- how artifact navigation works.

---

# 29. Accessibility integration

Orbweaver should generate graph-level accessibility information.

RECALL should ensure that this integrates with the surrounding artifact.

The diagram component should provide:

- meaningful diagram title,
- description,
- accessible node names,
- keyboard focus,
- textual summary or equivalent representation.

A RECALL component may supply additional semantic context beyond what Orbweaver can infer.

---

# 30. JSON and external data

Because Orbweaver graphs are plain serializable data, RECALL can eventually support diagrams sourced from external JSON.

Conceptually:

```text
DATA DIVISION.
   LOAD FROM "architecture.json".

PROCEDURE DIVISION.
   DISPLAY ARCHITECTURE-MAP
      USING SYSTEMS,
            DEPENDENCIES.
```

The component translates loaded data into an Orbweaver graph exactly as it would translate inline RECALL data.

Orbweaver does not care where the data originated.

---

# 31. AI-generated diagrams

The same boundary supports AI-generated structured diagrams.

Preferred:

```text
AI / agent
   ↓
structured semantic data
   ↓
RECALL component contract
   ↓
Orbweaver Graph
   ↓
diagram
```

Avoid making AI generate raw SVG or coordinates.

This preserves validation, themes, provenance, and deterministic rendering.

---

# 32. Generic versus opinionated components

The integration ecosystem should support two levels.

## Level 1 — generic

```text
GRAPH
FLOW-DIAGRAM
```

Useful for broad use.

## Level 2 — semantic/opinionated

```text
ARCHITECTURE-MAP
DEPENDENCY-MAP
DECISION-FLOW
```

These can expose better contracts and better defaults.

Later domain packages can build further:

```text
THREAT-MODEL
DATA-LINEAGE
SERVICE-TOPOLOGY
EVIDENCE-MAP
```

All may use Orbweaver without changing core.

---

# 33. Why this matters for the RECALL component ecosystem

Orbweaver should enable diagram behavior to become a reusable capability rather than requiring every component author to implement:

- SVG manually,
- edge routing,
- layout,
- node measurement,
- accessibility,
- selection,
- source mapping.

A domain package should focus on:

> What does this diagram mean?

Orbweaver should focus on:

> How does this semantic structure become a usable visual structure?

---

# 34. Example: flow component end to end

Author intent:

```text
Start
  ↓
Receive Request
  ↓
Validate
  ├── valid → Process
  └── invalid → Reject
```

RECALL data:

```text
FLOW-NODES
FLOW-EDGES
```

Component adapter:

```ts
toGraph(flowData)
```

Orbweaver graph:

```ts
{
  id: "request-flow",

  nodes: [
    { id: "start", type: "event", label: "Start" },
    { id: "receive", type: "process", label: "Receive Request" },
    { id: "validate", type: "decision", label: "Validate" },
    { id: "process", type: "process", label: "Process" },
    { id: "reject", type: "process", label: "Reject" }
  ],

  edges: [
    { from: "start", to: "receive", type: "flow" },
    { from: "receive", to: "validate", type: "flow" },
    { from: "validate", to: "process", type: "flow", label: "Valid" },
    { from: "validate", to: "reject", type: "flow", label: "Invalid" }
  ]
}
```

Orbweaver derives:

```text
positions
edge routes
node bounds
```

Renderer produces SVG.

RECALL embeds it in the final document.

---

# 35. Example: architecture component

RECALL author thinks in:

```text
SYSTEMS
DEPENDENCIES
BOUNDARIES
```

not generic graph primitives.

Adapter might map:

```text
SYSTEM → node
DEPENDENCY → edge
BOUNDARY → group
```

Orbweaver receives:

```ts
Graph {
  nodes,
  edges,
  groups
}
```

The architecture component can therefore evolve its authoring contract independently of Orbweaver.

---

# 36. No new RECALL syntax initially

Do not add syntax such as:

```text
DIAGRAM.
NODE ...
EDGE ...
```

during the initial integration.

First prove that the existing RECALL component/plugin architecture can express the capability.

Only consider syntax additions after real component usage demonstrates repeated authoring friction.

This follows:

> **Components first. Syntax only when evidence demands it.**

---

# 37. Potential scaffold integration

If RECALL supports component scaffolding from plugin manifests, diagram components should participate.

Conceptually:

```bash
recall scaffold FLOW-DIAGRAM \
  --plugin @semanticintent/recall-diagrams
```

could generate:

```text
FLOW-NODES
FLOW-EDGES
FLOW-DIRECTION
```

and a sample invocation.

This would make diagrams feel native to the existing component ecosystem.

Scaffolding belongs to RECALL/plugin metadata, not Orbweaver core.

---

# 38. Versioning

Orbweaver and RECALL diagram components should version independently.

Example:

```text
@semanticintent/orbweaver        0.1.x
@semanticintent/recall-diagrams  0.1.x
@semanticintent/recall-compiler  current compatible version
```

`recall-diagrams` owns compatibility declarations for both dependencies.

Orbweaver should not declare compatibility with RECALL because it does not depend on RECALL.

---

# 39. Dependency direction

Allowed:

```text
recall-diagrams
   ├── depends on recall plugin APIs
   └── depends on orbweaver
```

Not allowed:

```text
orbweaver
   └── depends on recall-compiler
```

The dependency arrow must remain one-way.

```text
RECALL integration ─────→ Orbweaver
```

Never:

```text
Orbweaver ─────→ RECALL
```

---

# 40. Testing the integration

The integration package should have tests distinct from Orbweaver core.

## Orbweaver tests

Test:

```text
Graph → Scene → SVG
```

## RECALL diagram tests

Test:

```text
RECALL data
   ↓
component adapter
   ↓
expected Orbweaver Graph
```

and:

```text
RECALL source
   ↓
compile
   ↓
artifact contains expected diagram
```

This separation helps identify whether failures belong to:

- authoring contract,
- adapter,
- layout,
- renderer,
- compiler.

---

# 41. Golden integration fixtures

Initial fixtures should remain generic:

```text
basic-flow
decision-flow
dependency-map
simple-architecture
```

Each should exist in two forms eventually:

```text
Orbweaver TypeScript fixture
RECALL source fixture
```

The semantic result should be equivalent.

This proves that RECALL is an authoring front end to the same visualization core.

---

# 42. Integration milestones

## R0 — Orbweaver standalone

Complete the standalone Orbweaver prototype first.

Required:

- semantic graph,
- validation,
- hierarchical layout,
- SVG renderer,
- basic examples.

No RECALL dependency.

---

## R1 — Thin RECALL spike

Create one experimental RECALL plugin/component:

```text
FLOW-DIAGRAM
```

It should:

```text
RECALL data
  → Graph
  → Orbweaver
  → SVG
  → artifact
```

No new compiler syntax.

---

## R2 — Theme bridge

Map RECALL theme values into Orbweaver variables.

Acceptance:

The same flow diagram visibly belongs to two different RECALL themes without changing graph data.

---

## R3 — Provenance bridge

Populate Orbweaver `source` metadata from RECALL compilation context.

Acceptance:

Selecting a node can identify the corresponding RECALL source entity/range.

Full source-navigation UI is optional.

---

## R4 — Second semantic component

Implement:

```text
DEPENDENCY-MAP
```

If both `FLOW-DIAGRAM` and `DEPENDENCY-MAP` reuse the same adapter/runtime infrastructure, consider extracting shared integration utilities.

---

## R5 — Evaluate adapter package

Only now decide whether shared glue should become:

```text
@semanticintent/orbweaver-recall
```

Do not extract based on hypothetical reuse.

---

# 43. Integration success criteria

The RECALL integration is successful if:

1. Orbweaver core has no RECALL dependency.
2. A normal RECALL component can invoke Orbweaver.
3. RECALL authors provide semantic data, not coordinates.
4. The existing plugin system is sufficient.
5. The final diagram compiles into the normal RECALL artifact.
6. RECALL themes can influence Orbweaver rendering.
7. RECALL source identity can survive into diagram entities.
8. Different RECALL components can map different contracts into the same Orbweaver graph model.
9. No new RECALL language syntax is required.
10. Replacing Orbweaver's internal layout engine does not change RECALL source.

---

# 44. Integration failure criteria

Reconsider the architecture if:

- Orbweaver must import RECALL compiler internals,
- RECALL source must contain x/y coordinates,
- each RECALL diagram component reimplements layout,
- components emit raw SVG instead of semantic graphs,
- Orbweaver needs knowledge of `.rcpy`,
- themes require modifying semantic graph data,
- source provenance is lost during layout,
- the plugin system cannot return diagram fragments through normal compilation,
- every new diagram requires compiler changes.

---

# 45. Architectural invariant

The most important dependency invariant is:

```text
RECALL authoring
      ↓
RECALL component/plugin
      ↓
semantic adapter
      ↓
ORBWEAVER
      ↓
visual artifact
```

Never invert this relationship.

Orbweaver is a capability consumed by RECALL.

RECALL is not a host framework required by Orbweaver.

---

# 46. Relationship to `recall-ui`

Conceptually, `recall-ui` and `recall-diagrams` can remain sibling component ecosystems.

```text
                    RECALL
                      │
            component/plugin system
                      │
             ┌────────┴────────┐
             │                 │
        recall-ui        recall-diagrams
             │                 │
       document UI          diagrams
                               │
                               ▼
                           Orbweaver
```

`recall-ui` focuses on document/publishing components.

`recall-diagrams` focuses on semantic spatial visualization.

Both participate in the same RECALL authoring model.

This means diagrams should feel like components, not foreign embeds.

---

# 47. Long-term possibility: visual component ecosystem

Over time the boundary may become broader than conventional diagrams.

Orbweaver's semantic graph/layout/rendering machinery could support:

```text
flows
dependency maps
architecture maps
decision trees
timelines
relationship maps
evidence maps
lineage views
system topology
process maps
```

The RECALL component ecosystem determines how these are exposed to authors.

Orbweaver remains the lower-level spatial visualization substrate.

---

# 48. Long-term possibility: multiple projections

One semantic data set may support several RECALL components.

Example:

```text
DEPENDENCIES
      │
      ├──── DISPLAY DEPENDENCY-TABLE
      │
      └──── DISPLAY DEPENDENCY-MAP
```

One presents information textually.

One presents it spatially through Orbweaver.

This is an important RECALL advantage:

> **The source describes information; components choose its projection.**

Orbweaver adds spatial projection to that model.

---

# 49. Long-term possibility: source-aware visual navigation

Because the compiled artifact can preserve source information, future diagrams can become navigation surfaces.

Example:

```text
diagram node
    │
    ├── inspect metadata
    ├── inspect relationships
    ├── trace upstream/downstream
    └── view source
```

This changes the role of a diagram from static illustration to an inspectable projection of declarative source.

That capability should remain optional and composable.

---

# 50. Recommended implementation order

Do not begin this integration while Orbweaver's core model is still unstable.

Recommended order:

```text
1. Orbweaver Graph
2. Orbweaver validation
3. Orbweaver layout
4. Orbweaver SVG renderer
5. standalone generic examples
6. stabilize core API
7. RECALL FLOW-DIAGRAM spike
8. theme bridge
9. provenance bridge
10. second RECALL semantic diagram component
```

This keeps integration work from masking core design problems.

---

# 51. Suggested coding-agent handoff

Once standalone Orbweaver v0.1 is working, a coding agent can receive this document with a prompt such as:

```text
Read ORBWEAVER_SPEC.md and ORBWEAVER_RECALL_INTEGRATION.md completely.

Do not modify Orbweaver core yet.

Inspect the current RECALL compiler plugin/component APIs and the recall-ui
package as architectural references.

Design the smallest possible experimental FLOW-DIAGRAM integration using the
existing RECALL plugin system.

Requirements:

- no new RECALL syntax
- no Orbweaver dependency on RECALL
- no manual graph geometry in RECALL source
- component data must map into the Orbweaver Graph model
- layout must occur through Orbweaver
- SVG must compile into the normal RECALL artifact
- preserve a path for RECALL theme and source-provenance integration

Before implementing, report:
1. the existing plugin extension point you intend to use,
2. the component contract,
3. the adapter boundary,
4. any compiler limitations discovered.

Do not invent APIs that do not exist in the repository.
```

This forces implementation to conform to the actual RECALL compiler rather than assumptions made in this architecture document.

---

# 52. Decision summary

## Orbweaver

```text
independent
framework-agnostic
semantic
geometry-owning
renderer-owning
provenance-preserving
```

## RECALL

```text
author-facing
declarative
component-driven
plugin-driven
theme-owning
artifact-owning
source-owning
```

## Integration

```text
RECALL component
      ↓
semantic adapter
      ↓
Orbweaver Graph
      ↓
Orbweaver layout/render
      ↓
RECALL artifact
```

---

# 53. Core integration principles

### Principle 1

> **RECALL components own the authoring contract. Orbweaver owns visualization mechanics.**

### Principle 2

> **Authors declare meaning. Orbweaver owns geometry.**

### Principle 3

> **Orbweaver preserves source identity. RECALL interprets source identity.**

### Principle 4

> **Components first. Syntax only when evidence demands it.**

### Principle 5

> **The source describes information; components choose its projection.**

Together these principles allow Orbweaver to become a powerful visualization capability inside RECALL without turning either project into the other.
