# Orbweaver

> Semantic visual structures for declarative systems.

![Orbweaver — Meaning, made visible](docs/assets/orbweaver-og.png)

Orbweaver is a framework-independent TypeScript library for turning semantic
graphs into inspectable, accessible visual structures.

> **Authors declare meaning. Orbweaver owns geometry.**

Orbweaver is currently an early architectural prototype. The v0.1 work is
focused on a plain-data graph contract, deterministic derived layout, polished
SVG rendering, provenance preservation, and a small interaction model.

## Why Orbweaver exists

Software systems already contain meaning—in source code, configuration,
schemas, and the relationships between them—but that meaning is often scattered
across tools or reduced to diagrams that become stale as soon as they are drawn.

Orbweaver explores a different boundary: authors describe entities,
relationships, and provenance; the library validates that semantic structure
and derives its geometry. The resulting diagrams remain reproducible,
inspectable, accessible, and connected to their source.

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
artifact frames, and lightweight, dependency-free viewport navigation for
close inspection of detailed diagrams.

## Primary showcase — Northwind

The canonical Northwind database becomes an inspectable relational map with 13
tables, 13 foreign-key relationships, five semantic domains, primary-key
metadata, and source provenance—without authored coordinates.

![Northwind relational model rendered by Orbweaver](examples/generated/northwind-schema-dark.svg)

[Explore the interactive public gallery](https://orbweaver.semanticintent.dev/gallery)
or inspect the [Northwind semantic graph](examples/showcases.mjs) in source.

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
  renderGraph,
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

const svg = await renderGraph(graph, {
  layout: { direction: 'LR' },
  render: { theme: darkTheme },
})

await writeFile('checkout.svg', svg)
```

Run the example as an ES module with Node.js 20 or newer, then open
`checkout.svg` in a browser. For separate layout and rendering stages, custom
themes, semantic queries, and interaction, see the [Public API](docs/api.md).

## Development

```sh
npm install
npm run check
```

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
- [Public API](docs/api.md)
- [Release process](docs/releasing.md)
- [Implementation roadmap](docs/roadmap.md)
- [AI-assisted semantic visualization](docs/ai-assisted-semantic-visualization.md)
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
