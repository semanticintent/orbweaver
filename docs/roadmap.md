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

**Status:** Complete

- [x] Add neighborhood and direction queries.
- [x] Add keyboard and pointer selection helpers.
- [x] Expose inspection payloads with provenance.
- [x] Validate textual summaries and focus behavior.

**Gate:** A selected entity reveals relationships and origin without semantics
being reconstructed from SVG.

## Phase 5 — Showcase and v0.1

**Status:** Complete

- [x] Basic process flow.
- [x] Branching decision flow.
- [x] Dependency map.
- [x] Grouped system architecture.
- [x] Browser example gallery and release documentation.

**Gate:** An unfamiliar developer can install Orbweaver and render a polished,
accessible graph in under 15 minutes.

## Phases 6–8 — Distribution and package-native gallery

**Status:** Complete

- [x] Publish the framework-independent package to npm.
- [x] Establish the public website and package-native interactive gallery.
- [x] Add source inspection, SVG download, themes, focus mode, and persistent
  semantic selection.
- [x] Defer the layout engine until the gallery approaches the viewport.
- [x] Improve relationship hit targets and connected-entity emphasis.

**Gate:** The public gallery consumes the published package, preserves live
semantic interaction state, and keeps the initial gallery UI lightweight.

## Phase 9 — AI-assisted semantic visualization

**Status:** In progress

- [x] Specify a versioned `GraphProposal` envelope and JSON schema.
- [x] Validate proposal structure, forbidden fields, and resource limits.
- [x] Distinguish trusted provenance, supporting evidence, AI inference, and
  human acceptance.
- [ ] Add a browser-local JSON import and review lab.
- [ ] Add explicit accept, discard, JSON export, and SVG export actions.
- [ ] Define a provider-neutral generation adapter.
- [ ] Add one optional reference generator outside Orbweaver core.

**Gate:** An unfamiliar user can safely review and accept an untrusted semantic
proposal without AI output bypassing validation or entering the deterministic
layout and rendering pipeline directly.

See [AI-assisted semantic visualization](ai-assisted-semantic-visualization.md)
for the complete scope and delivery gates.

## Deferred integrations

RECALL, `recall-ui`, and StratIQX adapters are intentional future consumers.
They are architectural test cases, not dependencies of the v0.1 core.
