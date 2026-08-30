# AI-assisted semantic visualization

**Status:** In progress — 9A and 9B complete; 9C reference boundary active

**Target:** Phase 9 / Orbweaver v0.2 exploration

**Scope:** Provider-neutral generation boundary, validation experience, and
reference gallery lab

## Product thesis

AI is useful for proposing meaning, but it should not own the visual artifact.
Orbweaver turns a probabilistic proposal into a validated, deterministic, and
inspectable diagram.

```text
User intent + supplied evidence
              ↓
       AI graph proposal
              ↓
  structural and semantic validation
              ↓
      accepted semantic graph
              ↓
 deterministic layout and rendering
              ↓
 inspectable visual explanation
```

The AI boundary ends before normalization, layout, rendering, and interaction.
The same accepted graph must always enter the ordinary Orbweaver pipeline.

## Principles

1. **AI proposes; software validates.** Model output is untrusted input.
2. **Meaning, not geometry.** Generated coordinates, SVG, CSS, HTML, and
   layout-engine objects are rejected rather than interpreted.
3. **Evidence remains distinguishable from inference.** A model claim is not
   presented as verified provenance merely because it contains a citation.
4. **Human acceptance is explicit.** Generated proposals are previewed with
   diagnostics before becoming accepted graph data.
5. **Rendering stays deterministic.** Model choice cannot change layout or
   visual semantics after the graph is accepted.
6. **The core remains provider-neutral.** Orbweaver does not require an AI SDK,
   API key, prompt framework, or network connection.
7. **Accessible output is non-negotiable.** AI-assisted diagrams retain the
   same keyboard, textual-summary, and inspection requirements as authored
   diagrams.

## Trust boundary

Three states must remain visibly and programmatically distinct:

| State | Meaning | May render? |
| --- | --- | --- |
| Proposal | Untrusted model output | Preview only after structural validation |
| Validated proposal | Conforms to the proposal and graph contracts | Yes, with generated-state disclosure |
| Accepted graph | A human or host system explicitly accepted the proposal | Yes, as ordinary Orbweaver input |

Orbweaver validation proves contract conformance. It does not prove that a
model's claims are factually correct.

## Proposal envelope

AI integrations exchange a versioned envelope rather than a bare SVG or an
unattributed graph.

```ts
interface GraphProposal {
  schemaVersion: '1'
  graph: Graph
  generation: {
    provider?: string
    model?: string
    adapter: string
  }
  evidence?: EvidenceReference[]
  claims?: ProposalClaim[]
  warnings?: string[]
}

interface EvidenceReference {
  id: string
  label: string
  source?: string
  location?: string
}

interface ProposalClaim {
  entity: { kind: 'node' | 'edge' | 'group'; id: string }
  evidenceIds: string[]
  confidence?: 'low' | 'medium' | 'high'
  rationale?: string
}
```

The envelope is integration metadata, not a replacement for `Graph`. Accepted
graphs remain valid inputs to the existing public API without an AI runtime.
Raw prompts, credentials, hidden reasoning, and full source documents are not
stored in the envelope.

## Provenance and evidence

Existing entity `source` fields represent host-supplied or compiler-known
provenance. AI-generated claims use the proposal's `claims` and `evidence`
collections until a host verifies and promotes them.

The UI must label these categories clearly:

- **Source provenance:** location supplied by a trusted host or compiler;
- **supporting evidence:** material provided to the generator;
- **AI inference:** a relationship or entity proposed by the model;
- **human accepted:** a proposal explicitly approved for downstream use.

An adapter must never convert an unsupported model citation into trusted source
provenance automatically.

## Generation adapter boundary

Generation belongs in consuming applications or optional adapters:

```ts
interface GraphProposalGenerator<Input> {
  readonly id: string
  generate(input: Input, options?: GenerationOptions): Promise<GraphProposal>
}
```

The host owns authentication, model selection, context retrieval, rate limits,
cost controls, retries, and retention. Orbweaver owns proposal validation,
graph validation, deterministic visualization, and inspection primitives.

No AI provider becomes a dependency of `@semanticintent/orbweaver` during
Phase 9.

## Phase 9 reference experience

The first public experience is an **AI graph lab** adjacent to the gallery.
It should support:

1. Paste or import a `GraphProposal` as JSON.
2. Validate the envelope and contained graph without executing its content.
3. Present errors with JSON paths and affected semantic identities.
4. Preview a valid proposal using the normal Orbweaver renderer.
5. Inspect entities, relationships, evidence, inference, and warnings.
6. Explicitly accept or discard the proposal.
7. Download the accepted graph JSON or rendered SVG.
8. Load a documented example representing an AI-generated architecture
   explanation.

The lab establishes the contract before a hosted model endpoint is added. A
provider adapter can then be introduced without redesigning validation or the
review experience.

## Safety and resource limits

The reference implementation must:

- parse JSON as data and never evaluate generated code;
- reject markup, geometry, style, and renderer-specific fields;
- apply configurable limits to input bytes, nodes, edges, groups, label length,
  and metadata depth;
- escape all generated labels and descriptions through the existing renderer;
- prevent arbitrary network fetching from proposal contents;
- avoid persisting prompts, source material, or proposals by default;
- distinguish validation errors from factual uncertainty;
- keep downloads self-contained and free of credentials or hidden context;
- remain usable without an AI account or API key.

Initial reference limits:

| Resource | Default limit |
| --- | ---: |
| Proposal JSON | 1 MiB |
| Nodes | 250 |
| Edges | 500 |
| Groups | 50 |
| Label | 200 characters |
| Description | 2,000 characters |
| Metadata nesting | 8 levels |

Hosts may choose lower limits. Raising limits requires performance evidence.

## Out of scope for Phase 9

- Autonomous repository crawling;
- arbitrary URL retrieval;
- a general-purpose chat product;
- model-generated SVG, coordinates, themes, or CSS;
- editing the positioned scene directly;
- silently accepting or publishing model output;
- training, fine-tuning, or provider benchmarking;
- RECALL-specific syntax or compiler coupling;
- real-time collaborative diagram editing.

## Delivery increments

### 9A — Contract and validation

- [x] Specify the versioned proposal envelope and JSON schema.
- [x] Implement resource-limit and forbidden-field diagnostics.
- [x] Add fixtures for valid, invalid, adversarial, and unsupported proposals.
- [x] Document the distinction between provenance, evidence, and inference.

### 9B — Review lab

- [x] Add JSON paste/import to the website.
- [x] Add diagnostics, proposal disclosure, evidence inspection, and explicit
  accept/discard actions.
- [x] Reuse the package-native renderer and interaction controller.
- [x] Keep all proposal state local to the browser.

### 9C — Reference generator

- [x] Define the provider-neutral generator interface.
- [x] Add a deterministic server-side reference adapter in the website, not
  core.
- [x] Require adapter output conforming to the proposal schema.
- [x] Add cost, timeout, cancellation, and failure UX.
- [x] Add a server-gated optional model-backed reference adapter in the
  website, not core. Public inference stays disabled until the host enables its
  Cloudflare Workers AI binding and spending boundary.
- [x] Publish the prompt contract and a reproducible example without publishing
  secrets or private source material.

See [Optional model-backed proposal adapter](model-proposal-adapter.md) for the
prompt, limits, cost disclosure, enablement checklist, and test case.

## Acceptance gate

Phase 9 is complete when an unfamiliar user can provide untrusted proposal
JSON, understand every validation error, preview a valid graph, distinguish
evidence from AI inference, explicitly accept it, and export the result—while
Orbweaver core remains deterministic, provider-neutral, and free of AI runtime
dependencies.

The optional reference generator is complete only when the same review path is
used for generated and imported proposals; generation may not bypass
validation or acceptance.

## Success measures

- Zero invalid proposals reach layout or rendering.
- Zero generated geometry or executable markup is accepted.
- Every displayed AI inference is inspectable as generated content.
- Imported and generated proposals share one validation path.
- The lab works without credentials in import-only mode.
- Accepted output remains ordinary, portable Orbweaver graph JSON.

## Relationship to RECALL

RECALL can later become a trusted host and evidence source:

```text
RECALL source and compiler metadata
              ↓
    AI proposal or authored mapping
              ↓
      RECALL component contract
              ↓
        Orbweaver Graph
```

That integration should consume the Phase 9 contract. It must not move AI
generation, provider credentials, or RECALL concepts into Orbweaver core.
