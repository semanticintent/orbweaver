# Orbweaver

> Semantic visual structures for declarative systems.

[Explore Orbweaver](https://orbweaver.semanticintent.dev) ·
[Enter through orbweaver.stream](https://orbweaver.stream)

![Orbweaver — Meaning, made visible](docs/assets/orbweaver-og.png)

Orbweaver is a framework-independent TypeScript library for turning semantic
graphs into inspectable, accessible visual structures.

> **Authors declare meaning. Orbweaver owns geometry.**

Orbweaver is an early-stage open-source library with a published stable v0.1
line and an active v0.2 alpha. Its foundation combines a plain-data graph
contract, deterministic derived layout, polished SVG rendering, provenance,
semantic annotations, and a deliberately small interaction model.

## Why Orbweaver exists

Software systems already contain meaning—in source code, configuration,
schemas, and the relationships between them—but that meaning is often scattered
across tools or reduced to diagrams that become stale as soon as they are drawn.

Orbweaver explores a different boundary: authors describe entities,
relationships, and provenance; the library validates that semantic structure
and derives its geometry. The resulting diagrams remain reproducible,
inspectable, accessible, and connected to their source.

Systems continuously produce entities, decisions, evidence, and relationships.
Orbweaver gives that **semantic stream** a durable visual form people can
inspect, explain, and verify. The phrase describes the movement of meaning
through systems—not a requirement for streaming infrastructure or a change to
Orbweaver's deterministic graph contract.

The project is also an open engineering showcase. It brings together API and
type-system design, deterministic transformation pipelines, graph layout,
accessible SVG rendering, interaction design, testing, documentation, release
engineering, and a human-reviewed boundary for AI-assisted proposals.

## Install

```sh
npm install @semanticintent/orbweaver
```

## Current status

Phases 0–8 are complete. The semantic graph, validation, normalization, ELK
layered layout, renderer-independent scene model, accessible SVG renderer,
light and dark themes, semantic graph queries, provenance-aware inspection,
keyboard/pointer interaction, tests, build, and public repository foundation
are in place and published as the v0.1 line. Phase 9 formalizes AI-assisted
semantic visualization without coupling the core to an AI provider. See the
[implementation roadmap](docs/roadmap.md) for completed gates and future work.

The v0.2 alpha line adds human-reviewed proposal contracts, deterministic SVG
artifact frames, lightweight viewport navigation, and structured semantic
annotations that surface why an entity deserves closer inspection. Annotation
markers remain compact at overview scale, preserve accessible meaning in static
SVG, and reveal their complete context through semantic inspection.

The visual-intelligence line adds explainable semantic lenses and deterministic
semantic detail. Risk, trust, data-flow, provenance, ownership, and
modernization views derive emphasis from existing graph meaning. Explicit
`overview`, `standard`, and `close` states progressively disclose that meaning
without changing entity identity or layout geometry.

Focused path narratives extend that reading model across upstream dependencies,
downstream impact, data lineage, failure propagation, and trust crossings.
Every traversal is bounded, ordered, explainable, and available to static SVG
and keyboard interaction without introducing authored routes.

Generated legends make exported artifacts self-explaining. Orbweaver derives a
compact inventory from only the entity, relationship, status, annotation, and
active-view vocabulary present; authors choose whether to include it, but never
maintain colors or symbols by hand.

Architecture comparison closes the visual-intelligence sequence with a
stable-ID semantic diff. Target artifacts distinguish unchanged, introduced,
and changed meaning while preserving removed entities and annotations as
inspectable comparison data—without guessing renames or fabricating geometry.

Portable HTML artifacts carry that same discipline outside an application.
`renderHtmlArtifact` produces one offline file containing the normalized graph,
accessible SVG, semantic inspector, theme state, annotations, provenance, and a
small dependency-free runtime. The `orbweaver-html` command provides the same
path from a graph JSON file.

Versioned static exports complete the sharing surface. `renderSvgArtifact`
embeds the normalized graph, accessible text, semantic identity, and provenance
inside a standalone SVG. `renderPngArtifact` produces presentation-ready pixels
with explicit alt text and a companion manifest, using native browser APIs or a
host-supplied Node rasterizer rather than adding image machinery to the core.

Versioned graph and scene documents now make those boundaries durable across
releases. Orbweaver publishes one contract registry and JSON Schema collection,
losslessly migrates unversioned v0.1 graph data, rejects unknown future formats,
and returns stable diagnostics with a recommended action.

The active Phase 10E quality gate verifies adverse graph shapes, exact light
and dark SVG output, real-browser interaction, automated accessibility,
responsive and print behavior, supported Node.js releases, package size, and
representative layout/render timing. See [Quality and performance](docs/quality-and-performance.md)
for the matrix and measured budgets.

## WebMCP — agent-assisted semantic visualization

Orbweaver implements a bounded WebMCP interface in its public semantic
playground. ChatGPT or Codex can discover page-local tools, read the active
workspace and proposal contract, create or revise a semantic graph, add, update,
or remove annotations, inspect their meaning, and focus entities in the same
live diagram a person is viewing.

The integration deliberately keeps the trust boundary visible:

- agent input is validated as untrusted semantic data;
- mutations are atomic, revision-protected, and reversible;
- agent-authored annotations remain reviewable claims rather than established
  facts;
- Orbweaver derives layout and SVG rather than accepting authored geometry;
- agent-created revisions remain unaccepted previews;
- acceptance and export are human-only actions.

> **Agent proposes. Human decides.**

[Open the WebMCP playground](https://orbweaver.semanticintent.dev/playground),
read the [public WebMCP guide](https://orbweaver.semanticintent.dev/docs/webmcp),
or inspect the [implementation and trust model](docs/webmcp-semantic-playground.md).
The core `@semanticintent/orbweaver` package remains provider-neutral; WebMCP
is implemented by the website adapter over the same validation, rendering, and
interaction boundaries used by the manual interface.

## Primary showcases

### Northwind relational model

The canonical Northwind database becomes an inspectable relational map with 13
tables, 13 foreign-key relationships, five semantic domains, primary-key
metadata, and source provenance—without authored coordinates.

![Northwind relational model rendered by Orbweaver](examples/generated/northwind-schema-dark.svg)

[Explore the interactive public gallery](https://orbweaver.semanticintent.dev/gallery)
or inspect the [Northwind semantic graph](examples/showcases.mjs) in source.
The repository also includes a
[self-contained Northwind HTML artifact](examples/generated/northwind-schema.html)
that can be downloaded and opened without a server.

### Enterprise architecture landscape

The enterprise architecture showcase connects customer channels, business
capabilities, domain platforms, shared data and events, external partners, and
governance. Its annotations carry modernization risk, regulated trust
boundaries, ownership decisions, integration strategy, controls, and evidence
without crowding the topology.

[Open the enterprise architecture showcase](https://orbweaver.semanticintent.dev/gallery)
and select **06 Enterprise architecture**. Zoom or enter full screen, then
select marked entities to inspect why they matter.

Run the complete interactive gallery locally:

```sh
npm run examples:generate
npm run examples:serve
# http://127.0.0.1:4173
```

## Quick start

Create a semantic graph, validate it, and render an accessible SVG. Orbweaver
derives all coordinates and paths—the graph contains meaning only.

```ts
import { writeFile } from 'node:fs/promises'
import {
  createGraph,
  darkTheme,
  renderSvgArtifact,
  renderHtmlArtifact,
  validateGraph,
} from '@semanticintent/orbweaver'

const graph = createGraph({
  id: 'checkout',
  title: 'Checkout flow',
  nodes: [
    { id: 'cart', type: 'process', label: 'Cart' },
    { id: 'payment', type: 'decision', label: 'Payment accepted?' },
    { id: 'fulfillment', type: 'process', label: 'Fulfillment' },
  ],
  edges: [
    { from: 'cart', to: 'payment', type: 'flow' },
    { from: 'payment', to: 'fulfillment', label: 'Yes' },
  ],
})

const validation = validateGraph(graph)
if (!validation.valid) {
  throw new Error(JSON.stringify(validation.errors, null, 2))
}

const svg = await renderSvgArtifact(graph, {
  layout: { direction: 'LR' },
  render: { theme: darkTheme, includeLegend: true },
})

await writeFile('checkout.svg', svg.data)
```

Run the example as an ES module with Node.js 20 or newer, then open
`checkout.svg` in a browser. For separate layout and rendering stages, custom
themes, semantic queries, and interaction, see the [Public API](docs/api.md).

Create a self-contained interactive artifact from the same graph:

```ts
const html = await renderHtmlArtifact(graph, {
  theme: 'dark',
  provenance: { renderer: 'Architecture review' },
})
await writeFile('checkout.html', html)
```

For PNG output in a browser, use `renderPngArtifact`. Node applications pass
their approved rasterizer through the small `PngRasterizer` adapter instead of
pulling a native image dependency into Orbweaver core. See
[Static export reliability](docs/export-reliability.md) for the HTML, SVG, and
PNG guarantee matrix.

## Development

```sh
npm install
npm run check
npm run quality:check
```

`npm run check` is the fast Node and bundle gate. `npm run quality:check` also
launches the locally installed Playwright Chromium browser and runs performance
budgets; install it once with `npx playwright install chromium` when developing
from a fresh checkout. CI additionally covers Firefox and WebKit.

Contributions are welcome. Read [Contributing](CONTRIBUTING.md), the
[Code of Conduct](CODE_OF_CONDUCT.md), and the [Security Policy](SECURITY.md)
before participating. Please report vulnerabilities privately rather than in a
public issue.

## Architecture

```text
Application data
      ↓
Semantic graph
      ↓
Validation and normalization
      ↓
Layout adapter
      ↓
Positioned scene
      ↓
SVG renderer
```

The semantic graph never contains coordinates, SVG paths, CSS declarations,
or layout-engine-specific objects.

## Documentation

- [Architecture](docs/architecture.md)
- [Design and engineering discipline](docs/design-discipline.md)
- [Visual language](docs/visual-language.md)
- [Interaction and inspection](docs/interaction.md)
- [Portable HTML artifacts](docs/portable-artifacts.md)
- [Static export reliability](docs/export-reliability.md)
- [Contract compatibility and migration](docs/compatibility.md)
- [Semantic annotation layer](docs/semantic-annotations.md)
- [Semantic visual intelligence](docs/semantic-visual-intelligence.md)
- [Public API](docs/api.md)
- [Release process](docs/releasing.md)
- [Implementation roadmap](docs/roadmap.md)
- [AI-assisted semantic visualization](docs/ai-assisted-semantic-visualization.md)
- [AI-to-portable-artifact workflow](docs/ai-to-portable-artifact.md)
- [AI artifact brief](docs/ai-artifact-brief.md)
- [Agentic workflow memory](docs/agentic-workflow-memory.md)
- [WebMCP semantic playground and trust model](docs/webmcp-semantic-playground.md)
- [WebMCP Challenge submission](docs/webmcp-challenge-submission.md)
- [Reference proposal generator](docs/reference-generator.md)
- [Original prototype specification](ORBWEAVER_SPEC.md)
- [Project philosophy and biomimicry](ORBWEAVER_BIOMIMICRY.md)
- [Future RECALL integration](ORBWEAVER_RECALL_INTEGRATION.md)

## Non-goals for v0.1

Orbweaver is not a freeform editor, whiteboard, dashboard toolkit, charting
library, or manual vector-authoring system. RECALL integration is deliberately
deferred until the standalone core is stable.

## License

[MIT](LICENSE)
