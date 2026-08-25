# ADR 0001: Semantic graph as the public contract

- Status: Accepted
- Date: 2026-08-25

## Decision

Orbweaver's stable input contract is a plain-data semantic graph. Geometry,
renderer styling, and layout-engine objects are excluded from that contract.

Graph input is validated and normalized before it enters layout. Normalization
resolves generated identity and defaults without mutating caller-owned data.

## Consequences

- Graphs remain JSON-compatible and framework-independent.
- Layout and renderer implementations can change independently.
- Callers cannot manually position nodes in v0.1.
- Orbweaver must provide deterministic normalization and useful diagnostics.
