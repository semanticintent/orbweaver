# Agentic workflow memory

## Product notion

Orbweaver can serve as a **semantic review surface and durable visual memory for workflows that agents and people are running together**.

It is not an agent orchestrator, task runner, observability platform, or real-time collaboration service. Those systems own execution. Orbweaver makes approved semantic snapshots easier to inspect, compare, discuss, and retain.

```text
Agents, people, CI, tickets, and operational systems
                         ↓
         host produces an evidence-backed semantic snapshot
                         ↓
         Orbweaver validates, derives, and renders the graph
                         ↓
  reviewable diagram · annotations · provenance · portable artifact
```

## Why this matters

Modern delivery has distributed responsibility: a person defines intent, an AI agent proposes a change, CI tests it, another person approves a release, and an operational system reports the result. The workflow can be technically complete while remaining hard to explain.

ASCII diagrams are useful during a conversation. They are not durable sources of truth: they rarely retain stable identity, evidence, ownership, change over time, or a review trail. A semantic artifact can.

Orbweaver makes workflow structure visible without asking anyone to maintain visual coordinates by hand.

## Intended use cases

### Agent-assisted software delivery

Map intent, implementation, test evidence, review, release, rollback, and human approval. Annotate where an agent proposed rather than verified a claim, and where an accountable person or system remains required.

### CI/CD and release review

Render build, test, security, deployment, rollback, and evidence relationships. A host publishes a pipeline snapshot; the artifact exposes dependencies and trust boundaries without becoming the pipeline itself.

### Incident response and recovery

Capture signals, hypotheses, mitigations, owners, decisions, and unresolved risks as a reviewable snapshot. Preserve source references and annotations so the artifact explains what was known at the time.

### Legacy workflow understanding

Turn opaque business processes, exception paths, planning flows, and cross-application dependencies into inspectable system maps. An AI can help propose structure from supplied material; a person reviews it before relying on the result.

### Process improvement over time

Compare stable semantic IDs across workflow snapshots. A new approval gate, missing evidence path, changed dependency, or recovered exception route becomes an explainable semantic difference.

## The snapshot boundary

Orbweaver receives a semantic graph or proposal from a host integration; it does not directly poll an organization's systems or decide what happened.

The host owns:

- authentication, access control, data retrieval, retention, and audit policy;
- event ingestion, scheduling, orchestration, retries, and action execution;
- translation from domain records into evidence-backed entities and relationships; and
- the decision of which snapshot may be published or retained.

Orbweaver owns:

- graph and proposal validation;
- deterministic layout and rendering;
- semantic inspection, annotations, paths, lenses, and comparisons; and
- portable artifacts retaining rendered meaning and declared provenance.

This keeps the core lightweight and usable whether the host is a CI system, issue tracker, agent framework, compiler, operational service, or local script.

## A trustworthy flow

```text
Observed workflow facts / approved AI proposal
                  ↓
        semantic graph + source references
                  ↓
             validate and inspect
                  ↓
       human review and explicit acceptance
                  ↓
        snapshot, compare, or publish artifact
```

An agent may propose a graph, annotation, or revision. It does not establish that a relationship is factually true. Validation checks the semantic contract. It does not verify business facts, security decisions, or operational outcomes.

## What “live” should mean

For Orbweaver, “live” should normally mean **a current, host-produced semantic snapshot**—not an uncontrolled stream of changing pixels.

A host may refresh a snapshot after an approved event, a workflow stage, or a person's request. Stable identities let Orbweaver compare and explain what changed. Retained snapshots should carry host-supplied source and timestamp provenance as explicit, reviewable data.

## Design tests

Before adding an agentic-workflow capability, ask:

1. Does it improve semantic understanding, reviewability, or durable memory?
2. Can a host provide the facts without the core owning credentials or orchestration?
3. Does it preserve the boundary between proposed inference and verified evidence?
4. Can a person inspect, disagree with, annotate, and explicitly accept it?
5. Does it avoid turning Orbweaver into a generic dashboard, editor, or workflow engine?

If the final answer is no, the capability belongs in the host system—not in Orbweaver core.

## Future-compatible direction

The natural extension is **workflow snapshots over time**: stable entity and relationship IDs, changing status/evidence/annotations/provenance, explainable semantic comparison, and portable artifacts for review and archival.

That adds memory and understanding while preserving the discipline: systems and authors declare meaning; Orbweaver derives the visual structure.
