# AI to portable artifact

This guide turns an AI-assisted conversation into a durable Orbweaver artifact.
It is intended for Codex, Claude, or any assistant that can write files and
optionally run a local command. It is tool-neutral by design.

## The working distinction

Use an ASCII diagram when the conversation is still exploratory: it is fast,
temporary, and easy to revise inline.

Use an Orbweaver artifact when the result needs to be reviewed, shared,
attached to a ticket or decision record, or retained after the chat ends.
The artifact is not a drawing the AI authors. It is a derived visual view of a
plain semantic graph.

```text
Question or workflow
        ↓
AI proposes semantic Graph JSON
        ↓
Person reviews assumptions and meaning
        ↓
Orbweaver validates and derives the artifact
        ↓
One self-contained interactive HTML file
```

## Canonical prompt

Copy this prompt into an AI session, then replace the bracketed context.

```text
Instead of an ASCII diagram, create a valid Orbweaver Graph JSON for:

[describe the workflow, system, incident, or decision]

Model the semantic meaning only. Use stable IDs, concise labels, meaningful
node and relationship types, groups for real boundaries, descriptions, and
source references or annotations when they improve reviewability.

Do not author coordinates, SVG, CSS, HTML, transforms, or visual styling.
State any assumptions and unresolved questions before finalizing the graph.

Save the graph as [path/name.graph.json]. Validate it with the installed
Orbweaver package, then generate a portable artifact:

npx orbweaver-html [path/name.graph.json] \
  --output [path/name.html] \
  --theme dark

Report the output paths, validation result, graph counts, and a concise
summary of the semantic decisions. Do not treat the resulting artifact as
human-approved factual truth.
```

The CLI accepts an ordinary `Graph` JSON document. It does not accept a
`GraphProposal` envelope directly. When a workflow starts with a proposal,
complete the host's review and acceptance process before extracting its graph
for artifact generation.

## Review loop

The useful work happens before and after the command, not inside an arbitrary
layout adjustment loop.

1. Ask the AI to identify entities, relationships, system boundaries, and
   evidence or assumptions.
2. Review the JSON for missing decision points, incorrect directionality,
   invented relationships, and ambiguous labels.
3. Add annotations for risks, constraints, evidence, and decisions that a
   reviewer should see in the inspector.
4. Generate the HTML file with `orbweaver-html`.
5. Open the file locally and inspect selected nodes, relationships, and groups.
6. Keep the JSON beside the HTML so the semantic source remains reviewable and
   reproducible.

If the meaning changes, revise the JSON and regenerate. Do not edit generated
SVG paths or HTML layout to make the result look different.

## Minimum semantic shape

The model should begin from a small graph and grow only when the relationships
are meaningful:

```json
{
  "id": "order-recovery",
  "title": "Order recovery workflow",
  "description": "How a failed payment moves through review and recovery.",
  "nodes": [
    { "id": "payment-failed", "label": "Payment failed", "type": "event" },
    { "id": "review", "label": "Review recovery", "type": "process" },
    { "id": "notify-customer", "label": "Notify customer", "type": "service" }
  ],
  "edges": [
    { "id": "failure-review", "from": "payment-failed", "to": "review", "type": "event" },
    { "id": "review-notify", "from": "review", "to": "notify-customer", "type": "flow" }
  ],
  "groups": [
    { "id": "recovery", "label": "Recovery workflow", "nodeIds": ["payment-failed", "review", "notify-customer"] }
  ]
}
```

Use stable IDs, not labels, as relationship targets. Keep the graph semantic:
coordinates and visual markup are deliberately outside its contract.

## What the portable artifact contains

The generated HTML file contains the rendered accessible SVG, normalized graph
semantics, semantic inspector, node/edge/group selection, relationship
emphasis, provenance, and optional theme controls. It can be opened locally
without a server, package installation, network connection, or Orbweaver
website access.

It deliberately does not contain WebMCP tools, model credentials, host
callbacks, an editor, or a collaboration service.

## Working safely with organizational material

Use the same data-handling policy you would apply to any AI-assisted work.

- Prefer sanitized examples when external model processing is not approved.
- Keep generated JSON and HTML in the appropriate repository, ticket, or
  approved document store.
- Treat AI-proposed evidence, ownership, risks, and causal claims as review
  inputs—not verified facts.
- Avoid embedding secrets, customer data, access tokens, or private source
  content in the graph or its provenance.

## A good handoff

An AI-assisted artifact handoff should contain four things:

1. `workflow.graph.json` — the semantic source of truth.
2. `workflow.html` — the portable interactive artifact.
3. A short assumptions note or annotations inside the graph.
4. The command used to regenerate the file.

That is enough for another person—or another AI session—to inspect, revise,
and reproduce the artifact without reconstructing the original conversation.
