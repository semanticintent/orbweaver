# Orbweaver — WebMCP Challenge submission

**Working title:** Orbweaver — Agent proposes. Human decides.

**Tagline:** Turn natural-language intent into a validated, inspectable semantic
diagram on the same live page—without giving the agent authority to accept it.

**Live app:** <https://orbweaver.semanticintent.dev/playground>

**WebMCP guide:** <https://orbweaver.semanticintent.dev/docs/webmcp>

**Public source:** <https://github.com/semanticintent/orbweaver>

**Demo video:** <https://youtu.be/vEsgjJGgSOw>

## Submission description

Orbweaver is a semantic visualization library and live design workspace for
structured systems. A person can describe a workflow in ordinary language;
ChatGPT or Codex discovers six page-local WebMCP tools, reads the active
GraphProposal contract, and creates a validated diagram directly in the shared
browser workspace.

The agent proposes meaning, not pixels. It supplies entities, relationships,
groups, evidence, and claims. Orbweaver rejects authored coordinates, SVG,
HTML, CSS, and executable markup, then deterministically derives the layout and
accessible SVG. Every entity remains selectable and inspectable by stable
semantic identity.

The human-agent boundary is deliberate. Agent-created changes require the
expected workspace revision, validate atomically, appear as an untrusted
preview, and can be undone. The agent cannot accept a revision or enable JSON
and SVG export. A person must inspect the result and explicitly decide whether
to accept it.

## What WebMCP makes possible

Without site tools, an agent would need to infer controls and repeatedly
manipulate a large JSON editor. With WebMCP, it can use the same application
controller as the visible interface:

1. read the current workspace and revision;
2. read the bounded GraphProposal v1 contract;
3. create or revise semantic content atomically;
4. inspect an entity's relationships, claims, evidence, and provenance;
5. focus that entity in the live deterministic diagram;
6. leave acceptance and export to the person.

The complete workflow still works manually in browsers without WebMCP.

## Six-tool surface

| Mode | Tool | Purpose |
| --- | --- | --- |
| Read | `orbweaver_get_workspace` | Read revision, state, diagnostics, selection, and graph summary. |
| Read | `orbweaver_get_proposal_contract` | Read supported semantics, limits, and forbidden fields. |
| Read | `orbweaver_inspect_semantics` | Inspect identity, relationships, evidence, claims, and provenance. |
| Focus | `orbweaver_focus_entity` | Select an entity and open the visible semantic inspector. |
| Propose | `orbweaver_create_proposal` | Create a complete validated, unaccepted proposal. |
| Revise | `orbweaver_revise_proposal` | Apply bounded semantic operations at an expected revision. |

## Judging-criteria narrative

### Usefulness

Orbweaver turns architecture, data models, workflows, compiler output, and
declarative systems into diagrams that people can inspect and publish. WebMCP
removes the translation burden between natural-language intent and the strict
semantic contract while preserving review.

### Originality

The diagram is not a drawing the agent authors. It is a deterministic artifact
derived from a versioned semantic proposal. The interaction centers on meaning,
provenance, revision safety, and human judgment rather than freeform canvas
automation.

### Execution

The public implementation includes six strict tools, conflict protection,
atomic validation, accessible announcements, reversible mutation, deterministic
layout, entity inspection, zoom and pan, accepted-only export, unsupported-
browser fallback, public documentation, and responsive presentation.

### Thoughtful WebMCP use

Every tool reuses the existing workspace controller and validation boundary.
Inputs are narrow, side effects are explicit, results describe visible changes,
and semantic writes never bundle acceptance. WebMCP adds a shared agent
interface without adding an AI provider dependency to Orbweaver core.

### Human-agent experience

The person and agent see one live workspace. Activity messages attribute tool
changes, the diagram visibly focuses inspected entities, and the trust banner
never confuses structural validation with factual truth. The core product rule
is visible throughout: **Agent proposes. Human decides.**

## Three-minute demo script

### 0:00–0:20 — The problem

Show the empty playground and say:

> Systems already contain structured meaning, but turning that meaning into a
> polished diagram usually means writing diagram syntax, placing shapes, or
> trusting opaque generated output.

### 0:20–0:40 — The boundary

Show `/docs/webmcp`, the six-tool table, and the trust boundary:

> Orbweaver lets the agent propose semantic structure. Orbweaver derives the
> geometry. Only the person can accept and export the result.

### 0:40–1:30 — Create

Open the playground in ChatGPT Desktop and send the canonical order-fulfillment
prompt from the WebMCP guide. Show tool discovery, then the generated five-node,
four-edge, three-group preview. Focus `Reserve inventory` and open its inspector.

Call out:

- shared live workspace;
- revision `0 → 1`;
- `VALIDATED · UNTRUSTED PREVIEW`;
- disabled export;
- semantic inspection rather than pixel generation.

### 1:30–2:15 — Revise

Ask the agent to add `Delivery tracking` after `Prepare shipment` with a labeled
edge. Show the updated diagram and focused node.

Call out:

- expected-revision conflict protection;
- atomic whole-proposal validation;
- revision `1 → 2`;
- acceptance remains false.

### 2:15–2:40 — Undo and human control

Click **Undo agent change** yourself. Show the previous graph return at revision
3. Point to disabled export and the still-unaccepted trust banner.

### 2:40–3:00 — Close

Show the gallery briefly, then return to the WebMCP guide:

> Orbweaver is a lightweight open-source semantic visualization library. WebMCP
> makes the live workspace agent-native without surrendering deterministic
> rendering, provenance, or human judgment. Agent proposes. Human decides.

## Canonical creation prompt

> Read the Orbweaver workspace and proposal contract. Create an unaccepted
> semantic proposal for an order-fulfillment system: receive an order, authorize
> payment, reserve inventory, prepare shipment, and notify the customer. Group
> the entities meaningfully, connect the workflow, render the preview, and focus
> the inventory reservation step. Do not accept the revision.

## Submission checklist

- [x] Working public app.
- [x] Public source repository.
- [x] Project description drafted.
- [x] Canonical demo flow verified in ChatGPT Desktop.
- [x] WebMCP documentation and privacy disclosure published.
- [x] Judging-criteria narrative drafted.
- [x] Three-minute demo script drafted.
- [x] Confirm Devpost registration and participant eligibility.
- [x] Record and upload the demo video: <https://youtu.be/vEsgjJGgSOw>.
- [x] Create and publish a center-safe hero thumbnail.
- [x] Complete every required Devpost field and attribution.
- [x] Re-run the production smoke test immediately before submission.
- [x] Submit before September 3, 2026 at 1:00 p.m. Pacific Time.

## Domain decision

Use `orbweaver.semanticintent.dev` for the challenge submission. It is live,
tested, HTTPS-enabled, and reinforces Orbweaver's relationship to the
semanticintent open-source portfolio.

If a shorter standalone domain is acquired, prefer `getorbweaver.dev` and
redirect it to the canonical site initially. Do not change the submission URL
until the redirect, TLS, metadata, and WebMCP tools have been verified in the
ChatGPT built-in browser.
