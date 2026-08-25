# Implementation roadmap

This document is the live phase tracker for Orbweaver. A phase is complete only
when its acceptance gate passes.

## Phase 0 — Specification consolidation

**Status:** Complete

- [x] Establish a concise public README.
- [x] Record architectural invariants.
- [x] Separate the live roadmap from the exploratory specification.
- [x] Convert resolved architectural decisions into ADRs as implementation
  evidence becomes available.

**Gate:** The v0.1 contract can be explained without RECALL-specific concepts.

## Phase 1 — Repository and semantic foundation

**Status:** Complete

- [x] Scaffold a strict ESM TypeScript package.
- [x] Add test, typecheck, build, and CI commands.
- [x] Implement graph input types.
- [x] Implement validation and deterministic normalization.
- [x] Add invariant-focused tests.
- [x] Confirm clean package output.

**Gate:** Four diagram fixtures can be represented without coordinates or
renderer-specific fields, and `npm run check` succeeds.

## Phase 2 — Layout proof

**Status:** Complete

- [x] Evaluate ELK against real fixtures.
- [x] Define the Orbweaver `Scene` contract.
- [x] Implement LR and TB hierarchical layout behind an adapter.
- [x] Verify deterministic output and input immutability.

**Gate:** All fixtures receive finite, readable geometry without leaking layout
engine types into the public API.

## Phase 3 — Visual language and SVG

**Status:** Complete

- [x] Define neutral premium light and dark themes.
- [x] Implement accessible static SVG rendering.
- [x] Establish screenshot-based visual QA.
- [x] Polish nodes, edges, labels, groups, and responsive scaling.

**Gate:** Showcase output is visually strong enough to lead the public README.

## Phase 4 — Semantic inspection

**Status:** Not started

- [ ] Add neighborhood and direction queries.
- [ ] Add keyboard and pointer selection helpers.
- [ ] Expose inspection payloads with provenance.
- [ ] Validate textual summaries and focus behavior.

**Gate:** A selected entity reveals relationships and origin without semantics
being reconstructed from SVG.

## Phase 5 — Showcase and v0.1

**Status:** Not started

- [ ] Basic process flow.
- [ ] Branching decision flow.
- [ ] Dependency map.
- [ ] Grouped system architecture.
- [ ] Browser example gallery and release documentation.

**Gate:** An unfamiliar developer can install Orbweaver and render a polished,
accessible graph in under 15 minutes.

## Deferred integrations

RECALL, `recall-ui`, and StratIQX adapters are intentional future consumers.
They are architectural test cases, not dependencies of the v0.1 core.
