# AI artifact brief

**Canonical public instruction:** https://orbweaver.stream/docs/ai-artifact-brief

Use this brief when an AI should turn a described system or workflow into a self-contained Orbweaver HTML artifact instead of an ASCII diagram.

## Instruction for the AI

```text
Create a valid Orbweaver Graph JSON for the workflow or system I describe.

Model semantic meaning only: stable IDs, concise labels, nodes, relationships, real system boundaries as groups, descriptions, source references, and annotations for assumptions, risks, constraints, evidence, or decisions.

Do not generate coordinates, SVG, CSS, HTML, transforms, or visual styling. Do not invent facts; state assumptions and unresolved questions clearly.

Save the result as [name].graph.json. Run:

npx orbweaver-html [name].graph.json --output [name].html --theme dark

If the command reports validation errors, correct the semantic JSON and retry. Report the JSON and HTML paths, graph counts, assumptions, and semantic decisions represented. The artifact is a reviewable output, not proof that its claims are factually true.
```

## Required Graph JSON shape

The CLI accepts an ordinary `Graph` JSON document, not a `GraphProposal` envelope. At minimum, provide `id`, `nodes`, and `edges`. Each node needs a stable `id` and a `label`; each edge needs `from` and `to` node IDs.

```json
{
  "id": "order-recovery",
  "title": "Order recovery workflow",
  "nodes": [
    { "id": "payment-failed", "label": "Payment failed", "type": "event", "group": "recovery" },
    { "id": "review", "label": "Review recovery", "type": "process", "group": "recovery" },
    { "id": "notify-customer", "label": "Notify customer", "type": "service", "group": "recovery" }
  ],
  "edges": [
    { "id": "failure-review", "from": "payment-failed", "to": "review", "type": "event" },
    { "id": "review-notify", "from": "review", "to": "notify-customer", "type": "flow" }
  ],
  "groups": [
    { "id": "recovery", "label": "Recovery workflow" }
  ],
  "annotations": [
    { "id": "review-assumption", "target": { "kind": "node", "id": "review" }, "type": "assumption", "body": "Manual review is required before retrying payment." }
  ]
}
```

Use the node's `group` field to place it inside a group. Use IDs, never labels, to target relationships and annotations.

## Output and review requirements

- Keep `[name].graph.json` beside `[name].html` so the artifact is reproducible.
- Open the generated HTML locally and inspect selected nodes, edges, groups, and annotations.
- Preserve source references and explicit assumptions as reviewable data.
- Regenerate from semantic JSON when meaning changes; never hand-edit generated layout or SVG.
- Do not include secrets, tokens, customer data, or unapproved source material.

The generated HTML is self-contained: accessible SVG, semantic inspection, selection, relationship emphasis, provenance, and optional theme controls. It does not include WebMCP tools, model credentials, host callbacks, or an editor.

## Deeper references

- [AI-to-portable-artifact workflow](ai-to-portable-artifact.md)
- [Portable HTML artifacts](portable-artifacts.md)
- [Public API](api.md)
