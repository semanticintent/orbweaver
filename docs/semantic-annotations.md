# Semantic annotation layer

**Status:** Core vertical slice complete

## Purpose

Annotations provide a restrained middle level between diagram topology and the
full semantic inspector:

```text
Diagram structure
      ↓ compact signal
Semantic annotation
      ↓ complete detail
Semantic inspector
```

An annotation answers: **Why should I inspect this entity more closely?** It
does not replace an entity description, relationship, status, claim, evidence
record, or source reference.

## Governing boundary

Authors declare annotation meaning and semantic targets. Orbweaver owns marker
symbols, count aggregation, severity treatment, placement, accessibility copy,
and any future progressive disclosure.

Annotations never contain coordinates, SVG, CSS, layout hints, or visibility
breakpoints. Adding an annotation does not change scene geometry.

## Contract

Annotations live in `Graph.annotations` and target the graph, a node, an
explicitly identified edge, or a group.

```ts
interface Annotation {
  id: string
  target?: {
    kind: 'graph' | 'node' | 'edge' | 'group'
    id?: string
  }
  label?: string
  body: string
  type?: string
  severity?: 'info' | 'warning' | 'critical'
  metadata?: Metadata
  source?: Provenance
}
```

The built-in vocabulary is deliberately small:

| Kind | Question it answers | Marker |
| --- | --- | --- |
| `note` | What context is useful? | `·` |
| `constraint` | What rule must remain true? | `§` |
| `risk` | What could fail or degrade? | `!` |
| `decision` | What judgment shaped this? | `◆` |
| `evidence` | What supports this meaning? | `◇` |
| `assumption` | What is believed but not established? | `?` |
| `change` | What changed in this revision? | `Δ` |

Unknown type strings remain valid and receive the neutral marker. This keeps
the semantic model extensible without allowing custom types to invent visual
grammar.

## Presentation

- One annotation displays its derived category marker.
- Multiple annotations collapse into a count marker.
- `warning` and `critical` reuse theme warning and danger tokens.
- Symbols and accessible text preserve meaning without color.
- Nodes place markers within their upper-right surface.
- Edge markers sit beside a label or near the longest route segment.
- Group markers sit beside the derived group label.
- Graph-level annotations remain available to queries and summaries but do not
  add a floating canvas object.

Markers are intentionally non-interactive. Selecting their owning entity opens
the existing semantic inspector, which receives the complete annotation data.

## Validation and safety

Graph validation checks annotation identity, target existence, and severity.
Edge annotations require an explicit edge ID so their target remains stable.
`GraphProposal` validation applies the same untrusted-input checks, caps a
proposal at 500 annotations by default, and rejects presentation fields and
executable markup through the existing proposal boundary.

## Accessibility

Annotation count and complete text are included in the accessible name of each
targeted SVG entity. The graph summary announces the total annotation count.
The visual marker is `aria-hidden` because its meaning is already present on
the owning entity and duplicating it would create noisy navigation.

Essential annotation meaning never depends on hover, zoom, animation, or color.

## Delivery sequence

1. **Complete — semantic foundation:** contract, validation, queries,
   inspection, proposal schema, and resource limits.
2. **Complete — derived markers:** node, edge, and group marker rendering,
   aggregation, severity, and accessibility.
3. **In evaluation — progressive detail:** consider a one-line close-view
   summary only after density, viewport, browser, and gallery testing. The
   inspector remains the canonical full-detail surface.

## Acceptance criteria

- An annotation survives creation, normalization, layout, rendering,
  inspection, and proposal validation without authored geometry.
- Invalid targets and severities fail before layout.
- Markers do not change node or scene dimensions.
- Multiple annotations remain visually compact.
- Static SVG retains annotation signals and accessible meaning.
- The complete detail remains available through semantic inspection.
