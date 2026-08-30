# Reference proposal generator

Phase 9C proves that an application can generate an untrusted semantic
proposal without coupling Orbweaver core to an AI provider.

The first implementation lives in the Orbweaver website and uses a
deterministic mock. It makes no model call, needs no credentials, has an
estimated cost of USD 0, and persists nothing. Its purpose is to exercise the
same boundary a future model-backed adapter must use.

## Provider-neutral contract

```ts
interface GraphProposalGenerator<Input> {
  readonly id: string
  readonly label: string
  estimate(input: Input): {
    estimatedCostUsd: number
    mode: 'deterministic' | 'model'
  }
  generate(
    input: Input,
    options?: { signal?: AbortSignal },
  ): Promise<GraphProposal>
}
```

The host application owns credentials, model selection, input retrieval,
timeouts, cancellation, rate limits, cost controls, and retention. The adapter
returns semantic data only. It may not return coordinates, SVG, HTML, CSS, or
renderer configuration.

## Reference HTTP boundary

The lab calls a same-origin server endpoint:

```http
POST /api/proposals/generate
Content-Type: application/json

{
  "prompt": "Map a safe proposal review workflow.",
  "evidence": "Human acceptance is required."
}
```

The reference endpoint limits request size, prompt length, evidence length,
and execution time. It validates the adapter result with
`validateGraphProposal` before returning it and marks responses `no-store`.

The browser then validates the returned proposal again. A successful model or
server response cannot bypass the ordinary import, diagnostics, preview,
inspection, acceptance, or export path.

## Reproducible mock

The deterministic adapter always produces the same six-entity review topology
for equivalent input. User intent supplies the graph title, and the optional
evidence summary becomes an explicitly generated evidence reference. Neither
is promoted to trusted entity provenance.

This enables reproducible tests for:

- server-side adapter execution;
- structured `GraphProposal` output;
- server and client validation;
- cancellation and timeout UX;
- cost and adapter disclosure;
- explicit human acceptance.

## Model-backed adapter gate

The website now includes a server-gated Cloudflare Workers AI reference
adapter. It uses structured JSON output, server and browser validation, a
declared cost ceiling, timeout/cancellation handling, and no browser-side
credential. It remains disabled until the host deliberately enables it.

See [Optional model-backed proposal adapter](model-proposal-adapter.md) for its
prompt contract, enablement checklist, and reproducible test input. It remains
an optional website integration; `@semanticintent/orbweaver` stays
provider-neutral and free of AI runtime dependencies.
