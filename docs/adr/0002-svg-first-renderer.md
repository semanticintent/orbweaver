# ADR 0002: SVG is the first renderer

- Status: Accepted
- Date: 2026-08-25

## Decision

Orbweaver v0.1 will render SVG before considering Canvas or other targets.

## Consequences

- Visual entities can remain addressable DOM elements.
- Text, focus, accessible names, and source identity can be preserved.
- Output can be embedded in self-contained HTML artifacts.
- Large-graph optimization is deferred.
