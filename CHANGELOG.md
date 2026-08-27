# Changelog

All notable changes to Orbweaver will be documented here.

## 0.2.0-alpha.2 — 2026-08-27

- add optional deterministic SVG artifact frames with visible title,
  description, version, as-of date, explicit generation time, and renderer
  provenance;
- serialize artifact-frame metadata into the SVG while preserving accessible
  `<title>` and `<desc>` content;
- keep embedded diagrams unframed by default and enable presentation-ready
  frames for generated showcase downloads.

## 0.2.0-alpha.1 — 2026-08-26

- Add the provider-neutral `GraphProposal` version 1 contract and JSON Schema;
- validate untrusted proposals with path-specific structural, semantic, safety,
  evidence, and resource-limit diagnostics;
- add valid, invalid, oversized, circular, and adversarial proposal coverage.

## 0.1.2 — 2026-08-26

- Strengthen connected-node emphasis with brighter borders, lifted surfaces, and a soft accent glow;
- increase contrast between related and unrelated entities during relationship inspection;
- ensure interactive selection styling takes precedence over passive health and status colors.

## 0.1.1 — 2026-08-26

- Add continuous 16-pixel interaction paths behind visible relationships;
- make solid, dashed, labeled, and unlabeled edges easier to select without changing their appearance;
- cover consecutive relationship selection and connected-node highlighting with regression tests.

## 0.1.0 — 2026-08-25

Initial architectural proof:

- JSON-compatible semantic graph, validation, and deterministic normalization;
- provenance-preserving node, edge, group, and annotation models;
- ELK-backed layered layout with LR, RL, TB, and BT directions;
- renderer-independent scene geometry and routed edges;
- accessible SVG renderer with premium light and dark themes;
- semantic treatments for common node and relationship types;
- graph summaries, semantic queries, inspection payloads, and source identity;
- pointer and keyboard interaction with selected, related, and muted states;
- four public showcase diagrams and interactive gallery;
- Node and browser-oriented package verification.
