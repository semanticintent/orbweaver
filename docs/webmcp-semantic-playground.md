# WebMCP semantic playground

**Status:** In progress — W1–W3 complete; W4 next

**Surface:** `orbweaver.semanticintent.dev/playground`

**Ownership:** Website-led integration consuming `@semanticintent/orbweaver`

## Product statement

The playground is a semantic design workspace where a person and an agent can
create, validate, inspect, revise, and export an Orbweaver diagram through the
same live page.

The central interaction is:

```text
Human intent
    ↓
Agent proposes GraphProposal v1 through a page tool
    ↓
Orbweaver validates untrusted semantic data
    ↓
Validated proposal appears as a deterministic diagram
    ↓
Human and agent inspect and revise the proposal
    ↓
Human explicitly accepts and exports the artifact
```

WebMCP supplies the page-local agent interface. It does not replace the graph
contract, validation boundary, layout engine, renderer, interaction controller,
or human acceptance gate.

## User promise

> Describe a system, inspect the proposed meaning, refine it with an agent,
> and let Orbweaver compose the visual.

The playground must also remain fully useful without an agent. A visitor can
paste or edit proposal JSON, validate it, inspect the diagram, and export the
accepted result using the ordinary interface.

## Relationship to existing surfaces

| Surface | Responsibility |
| --- | --- |
| `/gallery` | Explore curated, accepted diagrams |
| `/lab` | Exercise the experimental proposal and generator boundary |
| `/playground` | Create and revise one live semantic workspace |
| `/docs` | Learn contracts, APIs, and design discipline |

The playground should compose proven gallery and lab capabilities rather than
forking them. After the playground stabilizes, `/lab` may remain as a focused
technical demonstration or redirect to a playground example mode.

## Architectural boundary

The first implementation belongs in `orbweaver-website`.

```text
ChatGPT or Codex built-in browser
              ↓ WebMCP page tools
      Playground WebMCP adapter
              ↓ narrow commands
       Workspace controller
        ↙                 ↘
 React workspace state    Orbweaver package
                          validation
                          normalization
                          layout
                          rendering
                          inspection
```

`@semanticintent/orbweaver` remains provider-neutral and unaware of WebMCP.
Only reusable semantic operations discovered during implementation should be
considered for the core package, and only through their own framework-neutral
contracts.

No model API, API key, server-side MCP endpoint, account, or persistence layer
is required for the initial experience.

## Workspace state model

The workspace has explicit states:

| State | Meaning | Exportable? |
| --- | --- | --- |
| Empty | No proposal has been supplied | No |
| Draft | Source exists but has not passed validation | No |
| Invalid | Validation produced blocking diagnostics | No |
| Preview | Valid proposal rendered as untrusted generated content | No |
| Accepted | Human accepted the current validated revision | Yes |
| Stale acceptance | An accepted proposal was subsequently changed | No |

Every semantic mutation increments a workspace revision and clears acceptance.
Theme, viewport, selection, and inspector changes do not alter the semantic
revision.

The initial version stores one workspace in browser memory. Optional local
draft recovery may use local storage later, with clear disclosure and an erase
control. Server persistence and multi-user collaboration are out of scope.

## Workspace controller

UI controls and WebMCP tools must call the same controller. Tool handlers must
not manipulate React state, SVG elements, or DOM selectors directly.

```ts
interface PlaygroundController {
  getWorkspace(): WorkspaceSnapshot
  getProposalSchema(): ProposalSchemaSummary
  replaceDraft(proposal: unknown, origin: ChangeOrigin): ReviewResult
  applyRevision(revision: ProposalRevision, origin: ChangeOrigin): ReviewResult
  validateDraft(): ReviewResult
  inspectEntity(ref: EntityRef): InspectionResult
  tracePath(request: TracePathRequest): TracePathResult
  focusEntities(request: FocusRequest): FocusResult
  acceptRevision(expectedRevision: number): AcceptanceResult
  discardDraft(expectedRevision?: number): DiscardResult
  createExport(format: 'json' | 'svg'): ExportResult
}
```

All mutating commands include or return the workspace revision. This prevents
an agent call based on stale state from overwriting a newer human edit.

## Initial WebMCP tool surface

The first release should expose six tools. A small, well-described surface is
easier for agents to select correctly and easier to test.

### Read tools

#### `orbweaver_get_workspace`

Returns the current state, revision, proposal summary, validation summary,
selection, and supported next actions. It does not return rendered SVG.

#### `orbweaver_get_proposal_contract`

Returns the supported `GraphProposal` version, semantic entity fields,
resource limits, forbidden geometry and markup fields, and a compact example.

#### `orbweaver_inspect_semantics`

Accepts either an entity reference or a bounded path query. Returns semantic
identity, relationships, claims, evidence, and source provenance. It may also
focus the result only when that reversible visual side effect is declared.

### Reversible write tools

#### `orbweaver_create_proposal`

Replaces an empty workspace or current draft with a complete untrusted
`GraphProposal`. It runs the existing validator before previewing anything and
returns structured diagnostics and the new revision.

It must never accept SVG, coordinates, HTML, CSS, or renderer configuration.

#### `orbweaver_revise_proposal`

Applies a narrow semantic change against an expected revision. The initial
revision language should support explicit operations rather than arbitrary
JavaScript or JSON Patch:

- add, update, or remove a node;
- add, update, or remove an edge;
- add, update, or remove a group;
- update graph title or description;
- attach or remove proposal evidence and claims.

The command validates the complete resulting proposal atomically. On failure,
the previous valid preview remains unchanged.

#### `orbweaver_focus_entities`

Selects a node, edge, group, or returned path in the visible diagram and opens
the semantic inspector. It changes presentation state only.

### Human-only actions in the first release

Acceptance, discard, and browser download remain ordinary visible controls for
the challenge version. This makes the trust boundary unmistakable and avoids
ambiguous confirmation behavior while WebMCP is experimental.

After browser testing, `orbweaver_accept_proposal` and export tools may be
considered only if their confirmation and result semantics are demonstrably
clear. Acceptance may never be bundled into proposal creation or revision.

## Tool contract rules

Every tool definition must:

- use JavaScript registration on the top-level page;
- feature-detect `document.modelContext?.registerTool`;
- use strict JSON schemas with `additionalProperties: false`;
- keep arguments narrow and bounded;
- identify read-only behavior and describe all side effects;
- reuse application validation and authorization;
- return the active diagram ID and workspace revision;
- return enough state to verify visible results;
- return structured errors rather than throwing raw application details;
- unregister or otherwise avoid duplicate tools across React lifecycles;
- preserve the complete non-WebMCP user interface.

The initial ChatGPT browser integration does not rely on declarative HTML tool
attributes or iframe-contained registration.

## Visual workspace

Desktop layout:

```text
┌──────────────────────┬──────────────────────────────┬──────────────────────┐
│ CONCEPT / SOURCE     │ LIVE DIAGRAM                 │ SEMANTIC INSPECTOR   │
│                      │                              │                      │
│ starter prompts      │ deterministic SVG            │ entity identity      │
│ proposal JSON        │ zoom, pan, focus             │ relationships        │
│ validation results   │ proposal-state disclosure    │ evidence and claims  │
│ revision activity    │ agent activity indicator     │ provenance           │
└──────────────────────┴──────────────────────────────┴──────────────────────┘
```

On narrow screens the panels become ordered tabs or stacked regions while the
diagram remains the primary surface.

Agent-originated changes must be visible. The interface shows:

- a brief `Updated by site tool` activity marker;
- which tool ran and whether it changed semantic or presentation state;
- validation status and current revision;
- generated/untrusted disclosure until human acceptance;
- the exact entities focused by an agent;
- an undo path for reversible semantic mutations.

The interface must not imply that validation proves factual correctness.

## Security and trust model

WebMCP tool input is untrusted input and passes through the existing Phase 9
proposal validation boundary.

Additional requirements:

- cap every tool payload below or at the existing 1 MiB proposal limit;
- enforce node, edge, group, evidence, claim, label, and metadata-depth limits;
- never evaluate strings or accept executable markup;
- never fetch URLs included in proposals;
- never expose prompts, credentials, hidden reasoning, or unrelated page data;
- validate expected workspace revisions before mutations;
- keep export disabled until the current revision is explicitly accepted;
- distinguish tool errors, validation errors, and factual uncertainty;
- announce meaningful visual changes through an accessible status region.

## Testing strategy

### Unit tests

- feature detection in unsupported browsers;
- correct registration names, descriptions, schemas, and annotations;
- no duplicate registration across mount/unmount cycles;
- strict rejection of unknown arguments;
- revision conflict behavior;
- create and revise atomicity;
- validation-limit and adversarial proposal coverage;
- structured success and error results;
- acceptance invalidation after semantic changes.

The registration API is mocked so most behavior runs in the normal website
test suite without a WebMCP-enabled browser.

### Integration tests

- tool-created proposal reaches the ordinary validation and rendering path;
- tool focus updates SVG selection and inspector content;
- manual edits are visible to subsequent tool reads;
- switching themes or viewport does not invalidate acceptance;
- changing semantics does invalidate acceptance;
- unsupported browsers retain the full manual workflow.

### Browser acceptance

Use the latest ChatGPT desktop app with site tools enabled and a supported
model. Verify discovery through the address-bar Site tools panel and review
calls through Recently used.

Canonical acceptance prompt:

> Create an order-processing architecture with a storefront, API gateway,
> checkout process, inventory service, order database, event queue, and
> external payment provider. Group the external system, validate the proposal,
> show it in the diagram, and focus the path from storefront to order store.

The gate passes when the proposal appears, invalid data cannot reach rendering,
the requested path is visibly selected, the inspector agrees with the tool
result, and export remains locked until the person accepts the current revision.

## Delivery plan

### W1 — Workspace foundation

- [x] Extract a website-local workspace controller from proven lab behavior.
- [x] Define workspace state, semantic revisions, commands, and results.
- [x] Create `/playground` with manual JSON load, validate, preview, inspect,
  accept, discard, and export;
- [x] Reuse the package renderer, interaction controller, and viewport
  controller.
- [x] Add controller-boundary and rendered-route acceptance tests.

**Gate:** The playground works completely without WebMCP.

**Result:** Passed. The manual-first workspace builds and its complete website
test suite passes before any page tools are registered.

### W2 — Read and focus tools

- [x] Add local WebMCP declarations and feature detection.
- [x] Add a registration lifecycle adapter that avoids duplicate tools while
  delegating through the current workspace bridge.
- [x] Register workspace, contract, inspection, and focus tools.
- [x] Expose visible agent activity and accessible announcements.
- [x] Test registrations with a mocked `document.modelContext`.

**Gate:** An agent can understand and focus the current diagram without
mutating semantic content.

**Verification status:** Passed on August 27, 2026 in the ChatGPT Desktop
built-in browser against the public playground. The browser discovered all four
W2 tools, read revision 1, inspected the `request` node and its `classify`
relationship, visibly focused the node, and opened the semantic inspector. The
validated proposal remained an unaccepted preview throughout the test.

### W3 — Create and revise tools

- [x] Register complete proposal creation as an untrusted preview.
- [x] Implement explicit graph, evidence, and claim revision operations.
- [x] Validate changes atomically with expected-revision conflict protection.
- [x] Add a visible human-operated undo for agent-created semantic changes.
- [x] Preserve explicit human acceptance and accepted-only export.

**Gate:** A natural-language request can become a visible, validated proposal
and can be revised without bypassing the Phase 9 trust boundary.

**Verification status:** Passed on August 27, 2026 in the ChatGPT Desktop
built-in browser against the public playground. Six tools were discovered. A
natural-language order-fulfillment request created revision 1 atomically from
revision 0 as a five-node, four-edge, three-group preview. A subsequent tool
call added and focused `Delivery tracking` plus its labeled edge at revision 2.
The visible human-operated undo restored the prior proposal at revision 3.
Throughout the sequence the proposal remained `VALIDATED · UNTRUSTED PREVIEW`,
`accepted: false`, and export stayed disabled.

**Result:** Gate passed. Creation, revision, focus, validation, monotonically
increasing undo, and human-only acceptance were verified end-to-end.

### W4 — Browser hardening and public presentation

- test in the ChatGPT built-in browser;
- verify tool discovery, safety review, visual results, and recent activity;
- test unsupported browsers and responsive layouts;
- add `/docs/webmcp`, example prompts, privacy disclosure, and challenge copy;
- record a short canonical demonstration and collect submission evidence.

**Gate:** An unfamiliar user can reproduce the canonical acceptance prompt on
the deployed site and understand what the agent changed and what still requires
human judgment.

## Deferred work

- hosted model generation owned by Orbweaver;
- accounts, cloud persistence, or multiplayer collaboration;
- freeform positioned-canvas editing;
- accepting model-generated SVG, coordinates, layout, theme, or CSS;
- arbitrary code execution or unrestricted patch formats;
- autonomous repository or URL crawling;
- silently accepting, publishing, or downloading agent output;
- RECALL-, CAL-, Mere-, or provider-specific behavior in core.

## Success measures

- A first-time user can create a useful diagram through one conversational
  request and one explicit acceptance decision.
- Zero invalid proposals reach layout or rendering.
- Every semantic mutation is attributable to a workspace revision and origin.
- Every agent-focused entity agrees with the semantic inspector.
- Manual and agent workflows share one controller and validation path.
- The non-WebMCP playground remains fully functional.
- The integration adds no AI SDK or provider dependency to Orbweaver core.
