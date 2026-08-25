# Contributing

Orbweaver is in its architectural-prototype stage. Changes should protect the
central separation between semantic meaning and derived presentation.

## Development workflow

```sh
npm install
npm run check
```

Before opening a change:

1. Add or update tests for observable behavior.
2. Keep geometry out of semantic graph types.
3. Do not expose third-party layout types from public APIs.
4. Preserve entity identity, metadata, and provenance through transformations.
5. Keep the core independent of frameworks and RECALL.

Architectural changes should be recorded as a short ADR in `docs/adr/`.
