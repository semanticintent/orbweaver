# Optional model-backed proposal adapter

Orbweaver core does not call a model. The public website may optionally expose
a provider-specific proposal generator, but every response remains an
untrusted `GraphProposal` that follows the ordinary validation and review path.

## Reference implementation

The Orbweaver website contains an opt-in Cloudflare Workers AI adapter. It uses
Cloudflare JSON Mode and the public `GraphProposal v1` JSON Schema. The adapter
is disabled by default through a server-side
`ORBWEAVER_MODEL_GENERATION_ENABLED` flag; deterministic generation remains the
default and has no model cost.

```text
Intent + optional evidence summary
              ↓
Cloudflare Workers AI (structured JSON only)
              ↓
server-side GraphProposal validation
              ↓
browser-side GraphProposal validation
              ↓
inspectable, unaccepted preview
              ↓
explicit human acceptance and local export
```

The website binding is not a package dependency. No provider SDK, credential,
network call, prompt, or model selection is shipped by
`@semanticintent/orbweaver`.

## Prompt contract

The model receives only the submitted intent and optional evidence summary,
plus these instructions:

```text
Create a GraphProposal version 1 for Orbweaver. Return only JSON that conforms
to the supplied schema. Model semantic meaning: stable IDs, concise labels,
nodes, typed relationships, real system boundaries as groups, descriptions,
and reviewable evidence or claims where justified.

Do not emit coordinates, positioned scenes, SVG, HTML, CSS, style objects,
renderer configuration, executable markup, or invented source provenance.
Treat supplied evidence as unverified input. State uncertainty as a warning or
annotation rather than presenting it as fact. Keep the graph compact enough to
review.
```

The host overwrites generation metadata with the actual adapter and model
identity. It never upgrades model-produced evidence references to trusted
source provenance.

## Safety and operating boundary

- The server accepts at most 16 KiB of request JSON, 2,000 prompt characters,
  and 4,000 evidence characters.
- Generation times out after five seconds; the browser can cancel its request.
- The model is constrained to JSON mode, but model output is still validated on
  the server and again in the browser. A syntactically structured response is
  not proof of correctness.
- The reference estimate is USD 0.001 and the per-request ceiling is USD
  0.002. Actual provider usage is subject to the configured model and provider
  billing; the UI discloses the estimate before and after generation.
- The service does not persist prompts, evidence, proposals, or acceptance
  decisions. Do not submit confidential, regulated, personal, or secret data.
- A failed, timed-out, disabled, or invalid model request never alters the
  current proposal.

## Enablement checklist

Before enabling the model mode publicly:

1. Configure the Cloudflare Workers AI binding for the website Worker.
2. Set `ORBWEAVER_MODEL_GENERATION_ENABLED` to `true` only after confirming
   account-level spending limits and the provider's data terms.
3. Exercise normal, invalid, timeout, cancellation, and unavailable cases.
4. Confirm model-generated responses display as `AI-GENERATED · UNTRUSTED`,
   remain unaccepted, and leave exports disabled until a person accepts them.
5. Update the website privacy notice if the provider, model, retention, or
   collection behavior changes.

## Reproducible example

Use this as a non-sensitive test input:

```text
Intent: Map an order-fulfillment workflow from customer order through payment
authorization, inventory reservation, shipment preparation, and customer
notification.

Evidence summary: Payment authorization can time out. A human must review the
generated proposal before it is accepted or exported.
```

Expected result: an unaccepted semantic proposal with groups, typed
relationships, a warning or annotation for the timeout/review constraint, and
no authored coordinates or visual markup.
