# Final narration

This is the narration used for the published WebMCP Challenge demonstration.

## 01 — Problem and promise

Complex systems already contain structure. Turning that structure into a useful
diagram usually means writing diagram syntax, placing shapes by hand, or
trusting generated output you can't inspect. Orbweaver takes a different
approach: the agent proposes meaning, the application derives the visual
structure, and the human decides.

## 02 — WebMCP collaboration

Here, ChatGPT and I are working with the same live Orbweaver page. Through
WebMCP, ChatGPT discovers six bounded tools and reads the workspace contract
before changing anything. I describe an order-fulfillment system in ordinary
language. The agent supplies entities, relationships, groups, claims, and
evidence—not coordinates or drawing instructions. Orbweaver validates the
proposal, computes the layout deterministically, and renders revision one.

## 03 — Inspectable result

The result is structurally valid, but it is still an untrusted preview. Every
entity has a stable semantic identity. Reserve inventory is focused, so I can
inspect its relationships and provenance directly in the visible workspace.
Validation does not equal acceptance, and export remains unavailable.

## 04 — Safe revision

Now I ask ChatGPT to add Delivery tracking after shipment preparation. The
revision tool requires the expected workspace revision, protecting the shared
state from stale writes. Orbweaver validates the complete result before
applying it. The workspace advances from revision one to revision two, while
acceptance remains false.

## 05 — Human authority

The agent can propose and revise, but it cannot accept its own work or enable
export. I can inspect the change, reject it, or undo it. Here, I undo the
agent's change myself, and Orbweaver restores the previous graph. Human
judgment is not an optional approval step. It is part of the architecture.

## 06 — Close

Throughout this demonstration, ChatGPT never draws pixels or manipulates the
interface. It uses page-local WebMCP tools to propose bounded semantic changes.
Orbweaver owns validation, revision history, deterministic layout, and the
trust state. The human retains the consequential decision. Orbweaver is open
source. The agent proposes meaning. Orbweaver makes it visible. The human
decides.
