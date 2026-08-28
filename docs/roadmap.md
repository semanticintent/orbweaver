# Implementation roadmap

This document is the live phase tracker for Orbweaver. A phase is complete only
when its acceptance gate passes. Cross-phase decisions follow the
[design and engineering discipline](design-discipline.md).

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
- [x] Add a browser-local JSON import and review lab.
- [x] Add explicit accept, discard, JSON export, and SVG export actions.
- [x] Define a provider-neutral generation adapter.
- [x] Add a deterministic server-side reference generator outside Orbweaver
  core, including cancellation, timeout, cost, and failure states.
- [ ] Add one optional model-backed reference adapter outside Orbweaver core.

**Gate:** An unfamiliar user can safely review and accept an untrusted semantic
proposal without AI output bypassing validation or entering the deterministic
layout and rendering pipeline directly.

See [AI-assisted semantic visualization](ai-assisted-semantic-visualization.md)
for the complete scope and delivery gates.

## Phase 10 — Portable artifacts and hardening

**Status:** In progress

### Semantic annotation layer

- [x] Activate the existing graph-level annotation contract for graph, node,
  edge, and group targets.
- [x] Add annotation severity, target validation, proposal limits, and schema
  support without accepting presentation or geometry.
- [x] Include targeted annotations in semantic inspection and accessible graph
  summaries.
- [x] Derive compact category/count markers for nodes, edges, and groups while
  preserving topology and scene geometry.
- [x] Add an annotated dependency showcase and contract, rendering,
  inspection, validation, and accessibility tests.
- [x] Carry progressive disclosure forward into the disciplined semantic
  level-of-detail scope in Phase 11B after public gallery evaluation.

### Portable artifact export

- [ ] Define a versioned, self-contained Orbweaver HTML artifact containing
  the accepted semantic graph, rendered SVG, minimal interaction runtime,
  inspector, theme state, and provenance metadata.
- [ ] Add a supported export API and CLI path for self-contained HTML.
- [ ] Make SVG export reliable across Node and supported browsers, with
  embedded accessibility and semantic identity metadata.
- [ ] Add PNG export for social posts, presentations, and other environments
  that do not accept SVG.
- [ ] Document which guarantees survive in SVG, PNG, and interactive HTML.

### Interaction and browser resilience

- [x] Add a dependency-free SVG viewport controller with deterministic fit,
  bounded zoom, pan, pinch, keyboard controls, and lifecycle cleanup.
- [ ] Test persistent node, edge, and group selection across repeated changes.
- [ ] Verify relationship hit targets and connected-entity emphasis at
  different zoom levels and viewport sizes.
- [ ] Harden keyboard navigation, visible focus, Escape/background clearing,
  and screen-reader summaries.
- [ ] Support multiple independently interactive diagrams on one page.
- [ ] Test mount, update, and destroy lifecycles for leaked listeners or stale
  interaction state.
- [ ] Define and continuously verify the supported browser matrix.

### Rendering resilience

- [ ] Add fixtures for empty, disconnected, cyclic, deeply nested, and dense
  graphs.
- [ ] Exercise long labels, Unicode, unusual metadata, and missing optional
  content.
- [ ] Verify nested groups, edge routing, collision behavior, responsive
  resizing, and print output.
- [ ] Establish deterministic visual-regression fixtures for light and dark
  themes.

### Contract, quality, and performance

- [ ] Formalize graph, scene, proposal, and portable-artifact schema versions.
- [ ] Define compatibility and migration policy for pre-1.0 artifacts.
- [ ] Add compatibility fixtures that can be opened by future releases.
- [ ] Improve diagnostics for invalid graphs and failed export operations.
- [ ] Add browser-level interaction and accessibility tests to CI.
- [ ] Establish bundle-size, layout-time, and render-time budgets with
  representative benchmark graphs.
- [ ] Document Node.js, browser, ESM, and bundler compatibility.

**Non-goals:** This phase does not add RECALL, CAL, Mere, `recall-ui`, or
StratIQX integration; a hosted collaboration service; a freeform diagram
editor; or provider-specific AI behavior to Orbweaver core.

**Gate:** A versioned semantic graph can be rendered, inspected, exported,
reopened, and verified as a self-contained artifact with equivalent meaning
and interaction across supported browsers. Static SVG and PNG exports clearly
document the smaller set of guarantees they preserve, and the complete quality
suite passes within its published compatibility and performance budgets.

## WebMCP semantic playground — Website track

**Status:** W1–W4 complete

- [x] Build a manual-first `/playground` workspace on the public website.
- [x] Share one workspace controller between visible UI actions and future page
  tools.
- [x] Register strict top-level JavaScript tools for workspace context,
  proposal contract, semantic inspection, and visible focus.
- [x] Add validated create and atomic revision tools with revision-conflict
  protection and undo.
- [x] Add atomic annotation creation, update, and removal through the existing
  revision tool, with inspection and workspace summaries.
- [x] Keep acceptance and export explicitly human-controlled for the initial
  release.
- [x] Verify discovery, execution, safety review, and visible results in the
  ChatGPT built-in browser.
- [x] Publish WebMCP documentation and a reproducible Northwind or commerce
  demonstration.

**Gate:** A person can ask an agent to create and revise a semantic diagram on
the live page, inspect every proposed entity and relationship, and explicitly
accept the current revision, while invalid input never reaches rendering and
the complete workflow remains available without WebMCP.

See [WebMCP semantic playground](webmcp-semantic-playground.md) for the product,
tool, security, testing, and delivery scope.

## Phase 11 — Semantic visual intelligence

**Status:** Complete — 11A–11E released and adopted by the public gallery

### 11A — Semantic lenses

**Status:** Complete

- [x] Define a declarative lens rule and explainable projection contract.
- [x] Add built-in risk, trust, data-flow, provenance, ownership, and
  modernization recipes.
- [x] Apply theme-owned match, context, and background treatment without
  changing layout geometry.
- [x] Expose lens reasons through inspection and accessible summaries.
- [x] Verify interactive and static SVG behavior across contrasting fixtures.
- [x] Publish the lens API in the next v0.2 prerelease and adopt it in the
  package-native public gallery.

### 11B — Semantic level of detail

**Status:** Complete

- [x] Define explicit overview, standard, and close detail states.
- [x] Derive disclosure from renderer-owned rules rather than graph-authored
  breakpoints.
- [x] Preserve identity, selection, hit targets, and geometry across levels.
- [x] Add explicit static export and reduced-motion behavior.
- [x] Publish the detail API in the next v0.2 prerelease and adopt it in the
  package-native public gallery.

### 11C — Focused path narratives

**Status:** Complete

- [x] Compose deterministic upstream, downstream, lineage, failure, and trust
  traversal recipes.
- [x] Return ordered paths, semantic reasons, summaries, and truncation
  diagnostics.
- [x] Add keyboard navigation and non-animated accessible equivalents.
- [x] Publish the focused-path API in the next v0.2 prerelease and adopt it in
  the package-native public gallery.

### 11D — Generated legends

**Status:** Complete

- [x] Derive a compact legend containing only vocabulary present in the
  rendered artifact.
- [x] Include active lens, detail, and focused-path state where applicable.
- [x] Support optional deterministic SVG legend output.
- [x] Publish the generated-legend API in the next v0.2 prerelease and adopt it
  in the package-native public gallery.

### 11E — Architecture comparison

**Status:** Complete in `0.2.0-alpha.10` and adopted by the public gallery

- [x] Define an inspectable semantic diff between two validated graphs.
- [x] Derive unchanged, introduced, removed, and changed states by stable ID.
- [x] Preserve removed semantics for inspection and accessible output.
- [x] Demonstrate a current-state versus target-state architecture fixture.
- [ ] Publish the comparison API in the next v0.2 prerelease and adopt it in the
  package-native public gallery.

**Non-goals:** Authored styling or breakpoints; manual geometry; decorative
animation; vendor icon catalogs; inferred architectural truth; a freeform
editor; or an enterprise architecture repository and governance suite.

**Gate:** A large semantic architecture can be viewed through explainable
lenses, progressively disclosed, traversed as bounded narratives, exported
with a derived legend, and compared with another version without changing its
authored geometry contract, losing identity, or materially burdening basic
consumers.

See [Semantic visual intelligence](semantic-visual-intelligence.md) for the
invariants, proposed contracts, acceptance gates, budgets, and ordered delivery
plan.

## Deferred integrations

RECALL, CAL, Mere, `recall-ui`, and StratIQX adapters are intentional future
consumers. They are architectural test cases, not dependencies of Orbweaver
core. Integration work begins only after the Phase 10 portability and hardening
gate passes.
