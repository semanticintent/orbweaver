# ADR 0003: ELK is the initial layout engine

- Status: Accepted
- Date: 2026-08-25

## Context

Orbweaver requires deterministic hierarchical layout, routed edges, direction
control, and a credible path to compound/group nodes in both Node and browsers.

## Decision

Use `elkjs` behind Orbweaver's `LayoutEngine` interface for the initial layered
layout. Convert semantic graphs into private ELK objects and translate ELK
results into Orbweaver `Scene` objects.

Node dimensions are estimated deterministically before layout. ELK types are
not exported from Orbweaver's public contracts.

## Consequences

- Layout is asynchronous.
- ELK is a runtime dependency but not a public data model.
- Compound layout and orthogonal routing are available for early fixtures.
- Bundle size must be measured before browser distribution is finalized.
- A future layout engine can be introduced without changing graph definitions.
