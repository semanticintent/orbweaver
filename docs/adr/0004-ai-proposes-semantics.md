# ADR 0004: AI proposes semantics; Orbweaver validates and renders

- Status: Accepted
- Date: 2026-08-26

## Decision

AI-assisted integrations produce a versioned, untrusted semantic graph
proposal. They do not produce SVG, coordinates, styles, or positioned scenes.

Every proposal passes structural limits and the ordinary Orbweaver graph
validation pipeline before preview. Human or host acceptance remains explicit.
Generation metadata, evidence, and AI inference remain distinguishable from
trusted source provenance.

AI providers are integrated by consuming applications or optional adapters.
`@semanticintent/orbweaver` remains deterministic, provider-neutral, usable
offline, and free of AI SDK dependencies.

## Consequences

- Imported and model-generated proposals share one validation and review path.
- Model output cannot bypass graph invariants or introduce authored geometry.
- A valid proposal may still be factually wrong; validation does not imply
  truth.
- Host applications own credentials, retrieval, cost, retention, and provider
  policy.
- Accepted output remains portable `Graph` data.
- A review experience and proposal contract must exist before conversational
  generation becomes a supported product surface.
