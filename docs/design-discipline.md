# Design and engineering discipline

Orbweaver turns structured system meaning into deterministic, inspectable
visual artifacts. This document records the discipline used to protect that
purpose as the project evolves.

It is a decision-making guide rather than a feature list. New capabilities
should strengthen the semantic pipeline without turning Orbweaver into a
general-purpose editor, application framework, or collection of unrelated
diagram features.

## Governing principle

> Add the smallest coherent capability that makes semantic artifacts easier to
> understand, inspect, verify, or carry between systems.

Novelty is not a goal. Familiar behavior is preferred when it is clear,
accessible, and dependable. A capability belongs in Orbweaver only when the
core library is the correct owner and the result preserves the project's
architectural invariants.

### The semantic stream

Systems continuously produce entities, decisions, evidence, and relationships.
Orbweaver turns that semantic stream into a durable visual structure without
making presentation the source of truth.

“Semantic stream” is product language for meaning moving through systems. It is
not a promise of event-stream processing, a transport protocol, or mutable
layout state. Inputs remain explicit graph documents; outputs remain
deterministic, inspectable artifacts.

## The discipline

### 1. Meaning precedes geometry

Authors and adapters declare entities, relationships, groups, metadata, and
provenance. Orbweaver derives dimensions, coordinates, routes, and presentation.
No feature should require semantic meaning to be reconstructed from pixels,
paths, DOM order, or manually maintained coordinates.

### 2. Preserve identity through every stage

Validation, normalization, layout, scene construction, rendering, interaction,
and export must retain stable entity identity. Metadata and provenance should
survive whenever the target artifact can represent them. A visual result is
not complete merely because it looks correct.

### 3. Prefer deterministic artifacts

Equivalent accepted input and options should produce equivalent output.
Generated identities, ordering, layout translation, SVG markup, and artifact
metadata must avoid ambient time, randomness, provider state, and hidden global
configuration unless those values are explicitly supplied.

### 4. Keep the core small and framework-independent

Orbweaver core owns the semantic graph, validation, normalization, derived
layout, renderer-independent scenes, rendering, inspection primitives, and
small artifact-level interactions. It does not own application navigation,
accounts, persistence, collaboration, model-provider credentials, or a host's
component system.

Framework adapters may make Orbweaver convenient; they must not become a
requirement for the underlying package.

### 5. Treat every dependency as architectural weight

A dependency is justified by capability, correctness, maintenance quality, and
the amount of difficult domain work it replaces—not by convenience alone.

Before adding one, ask:

1. Can platform capabilities or a small local implementation solve the bounded
   problem clearly?
2. Would the dependency enlarge the public contract or constrain consumers?
3. Does it add runtime weight to users who do not need the capability?
4. Can it remain behind an adapter and be replaced later?
5. Is its maintenance and security cost proportionate to its value?

ELK is isolated behind the layout boundary because graph layout is substantial
specialized work. SVG viewport navigation remains local because the required
behavior is small and the browser already supplies the necessary primitives.

### 6. Add interaction for comprehension, not manipulation by default

Orbweaver is primarily an inspection surface. Selection, relationship emphasis,
zoom, pan, keyboard control, and fullscreen viewing help readers understand an
artifact without changing its semantic source.

Interaction should be bounded, reversible, and compatible with ordinary page
behavior. The viewer must not unexpectedly trap scrolling, keyboard focus, or
touch gestures. Editing and freeform node placement require a separate product
decision rather than incremental additions to the inspection runtime.

### 7. Let the host own the experience around the artifact

The library exposes semantic payloads and narrow controllers. The host decides
how to present inspectors, source navigation, toolbars, fullscreen surfaces,
downloads, and application-specific actions. This keeps the package reusable
while allowing the public gallery to demonstrate a complete experience.

### 8. Accessibility is part of the artifact contract

Keyboard access, visible focus, textual summaries, meaningful labels, reduced
motion, and non-color cues are not optional polish. New visual or interactive
states must retain a usable non-pointer path and must not hide essential meaning
inside hover-only behavior.

### 9. AI proposes; deterministic systems decide and render

Model output is untrusted proposal data. It must pass resource limits, proposal
validation, review, and explicit host or human acceptance before entering the
ordinary graph pipeline. Provider behavior, retrieval, credentials, cost, and
retention remain outside core.

AI may accelerate semantic authoring. It does not receive authority to bypass
the graph contract or quietly invent trusted provenance.

### 10. Earn scope with evidence

Features advance through concrete examples, tests, compatibility checks, and a
clear ownership argument. One compelling demonstration is useful; repeated
behavior across different graph shapes and host contexts is stronger evidence.

A feature is not complete until its lifecycle is understood: mount, use,
update, export where applicable, destroy, and failure behavior.

## Decision test

Before implementation, answer these questions:

1. What reader or integrator problem does this solve?
2. Is the problem semantic, artifact-level, or host-application behavior?
3. Is Orbweaver core the smallest correct owner?
4. Which invariant must remain true?
5. What is the lightest implementation that behaves predictably?
6. What happens without a pointer, color perception, animation, or network?
7. Does the result remain deterministic and inspectable?
8. How will the capability be tested across contrasting graph shapes?
9. What new maintenance, bundle, compatibility, or security cost is accepted?
10. Which tempting adjacent features remain explicitly out of scope?

If these answers are unclear, the work needs more definition rather than more
code.

## Release discipline

Every release candidate should:

- preserve public graph and artifact contracts or document the migration;
- pass type checking, unit tests, package build, and browser-bundle validation;
- add focused tests for the behavior that motivated the change;
- validate relevant interaction across materially different diagram shapes;
- keep examples and documentation aligned with the published package;
- inspect the package contents before publication;
- publish prerelease work under the prerelease tag;
- update the public gallery only after the registry artifact is verified; and
- record deferred work instead of quietly widening the release.

Visual polish never substitutes for semantic correctness. Test coverage never
substitutes for visual inspection when layout or interaction changes. Both are
required in proportion to risk.

## Signs that Orbweaver should say no

Orbweaver should decline or defer a capability when it:

- requires authored coordinates in the semantic graph;
- couples core to a UI framework, product, or AI provider;
- primarily serves freeform drawing or whiteboarding;
- duplicates mature platform behavior without a bounded semantic need;
- makes ordinary browser navigation surprising;
- weakens deterministic output or stable identity;
- hides meaning inside presentation-only state;
- adds substantial runtime weight for an optional experience; or
- cannot be explained through a representative semantic graph and acceptance
  test.

Saying no is not minimalism for its own sake. It protects the conditions that
make Orbweaver useful as infrastructure: a small contract, strong artifacts,
clear ownership, and dependable composition.

## The standard

An Orbweaver capability should feel inevitable after it exists: small enough to
understand, strong enough to reuse, and precise enough that another system can
trust the meaning it carries.
