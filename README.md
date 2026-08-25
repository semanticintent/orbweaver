# Orbweaver

> Semantic visual structures for declarative systems.

Orbweaver is a framework-independent TypeScript library for turning semantic
graphs into inspectable, accessible visual structures.

> **Authors declare meaning. Orbweaver owns geometry.**

Orbweaver is currently an early architectural prototype. The v0.1 work is
focused on a plain-data graph contract, deterministic derived layout, polished
SVG rendering, provenance preservation, and a small interaction model.

## Current status

Phases 0–2 are complete. The semantic graph, validation, normalization, ELK
layered layout, renderer-independent scene model, tests, build, and public
repository foundation are in place. The visual language and SVG renderer are
next. See [the implementation roadmap](docs/roadmap.md) for live status.

## Intended API

```ts
import { createGraph, layoutGraph, validateGraph } from '@semanticintent/orbweaver'

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

const result = validateGraph(graph)
const scene = await layoutGraph(graph, { direction: 'LR' })
```

SVG rendering shown in the project specification is planned, not yet
implemented.

## Development

```sh
npm install
npm run check
```

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
- [Implementation roadmap](docs/roadmap.md)
- [Original prototype specification](ORBWEAVER_SPEC.md)
- [Project philosophy and biomimicry](ORBWEAVER_BIOMIMICRY.md)
- [Future RECALL integration](ORBWEAVER_RECALL_INTEGRATION.md)

## Non-goals for v0.1

Orbweaver is not a freeform editor, whiteboard, dashboard toolkit, charting
library, or manual vector-authoring system. RECALL integration is deliberately
deferred until the standalone core is stable.

## License

[MIT](LICENSE)
