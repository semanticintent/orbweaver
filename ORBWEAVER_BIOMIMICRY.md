# Why an Orb-Weaver?

> **Biomimicry for semantic visualization**
>
> Orbweaver is not named after a spider because diagrams look like
> webs.\
> It is named after a biological system in which **structure itself
> carries information**.

------------------------------------------------------------------------

## Meet the Orb-Weaver 🕸️

Orb-weaver spiders build one of nature's most recognizable information
structures: the orb web.

At first glance, the analogy to diagrams seems obvious. A web contains
nodes, connections, paths, a center, and a visible topology.

But that surface resemblance is not the reason for the name.

The deeper connection is much more interesting.

An orb web is not simply something a spider builds and then looks at. It
is a functional extension of the spider's sensory system. Activity
elsewhere in the web produces vibrations that travel through its
structure. The spider can use those signals to detect, localize, and
distinguish what is happening across an area much larger than its own
body.

The web is simultaneously:

-   **structure**
-   **network**
-   **sensor**
-   **signal path**
-   **information surface**
-   **interface to the surrounding world**

That is the idea behind Orbweaver.

> **The visual is not a picture of the information. It is a structure
> through which the information travels.**

------------------------------------------------------------------------

# The Biological Model

## The web is an extension of the spider

Research on orb-weaving spiders describes the web as an extension of the
animal's body and sensory system.

The spider does not need to physically occupy every point in the web.
Instead, the structure brings information about remote activity back to
the spider through vibration.

Researchers studying *Araneus diadematus* and *Zygiella x-notata*
describe orb webs as multifunctional structures with structural,
mechanical, and sensory roles. Some species can even monitor the web
remotely through a dedicated signal thread.

**Orbweaver translation:** a visualization should not merely display
entities. Its relationships should make distant parts of a system
intelligible from the structure itself.

``` text
event
  │
  ▼
structure changes / carries signal
  │
  ▼
relationship becomes perceptible
  │
  ▼
observer understands what happened
```

In software terms:

``` text
semantic entities
      │
      ▼
relationships
      │
      ▼
topology
      │
      ▼
visual structure
      │
      ▼
inspection / understanding
```

------------------------------------------------------------------------

# Biomimicry Principle #1 --- Structure Carries Meaning

A spider web is not an arbitrary arrangement of lines.

Its geometry affects how information propagates through it. Orb-weaving
spiders can influence vibration transmission through web geometry, silk
properties, tension, and construction.

Orbweaver adopts the same principle conceptually:

> **Topology is information.**

A dependency is not meaningful merely because two boxes happen to be
near each other.

A dependency is meaningful because the semantic model says:

``` text
A depends on B
```

Orbweaver derives the visual topology from that relationship.

The caller declares:

``` ts
{
  from: "checkout",
  to: "payment",
  type: "dependency"
}
```

Orbweaver decides how that relationship should occupy space.

This is the architectural rule:

> **Authors declare meaning. Orbweaver owns geometry.**

------------------------------------------------------------------------

# Biomimicry Principle #2 --- The Web Is an Information Surface

The orb web is more than a capture mechanism.

Vibrations originating from different sources propagate through the
structure. The spider senses those signals through mechanoreceptors in
its legs and uses the resulting information to understand activity
elsewhere on the web.

That suggests a different way to think about software diagrams.

Traditional diagram:

``` text
data
 ↓
drawing
 ↓
look at picture
```

Orbweaver:

``` text
semantic model
      ↓
visual topology
      ↓
relationships remain addressable
      ↓
interaction
      ↓
inspection
      ↓
information
```

A node should not become anonymous because it was rendered.

An edge should not become merely a line.

The visual structure should retain the identity and semantics of the
system that produced it.

------------------------------------------------------------------------

# Biomimicry Principle #3 --- Signals Preserve Origin

For an orb-weaver, a vibration is useful partly because the structure
allows the spider to determine where activity occurred.

Orbweaver applies a software equivalent through **provenance**.

A semantic node may carry its source:

``` ts
{
  id: "payment-service",
  type: "service",
  label: "Payment Service",

  source: {
    file: "architecture.rc",
    line: 84,
    path: "PAYMENT-SERVICE"
  }
}
```

That identity survives:

``` text
source
  │
  ▼
semantic node
  │
  ▼
layout
  │
  ▼
scene node
  │
  ▼
SVG element
  │
  ▼
inspection
```

The rendered diagram can therefore remain connected to the information
that created it.

In a future RECALL artifact, selecting a node could expose:

``` text
Payment Service
│
├── type
├── metadata
├── upstream relationships
├── downstream relationships
└── source
```

The diagram becomes an interface into the underlying semantic structure.

------------------------------------------------------------------------

# Biomimicry Principle #4 --- Local Signals Reveal Global Structure

An orb-weaver does not need a second representation of the web to
understand activity in it.

The relationships in the web themselves provide information.

Orbweaver aims for the same property.

Selecting one entity should eventually allow questions such as:

``` text
What connects to this?

What is upstream?

What is downstream?

Which group contains it?

What depends on it?

What path connects A to B?

Where did this entity come from?
```

The diagram is therefore not merely an illustration of a graph.

It is a **projection of an interrogable graph**.

``` text
                 upstream
                    │
                    ▼
neighbor ─────── [ NODE ] ─────── neighbor
                    │
                    ▼
                downstream
```

------------------------------------------------------------------------

# Biomimicry Principle #5 --- Geometry Serves Function

Orb webs are not decorative geometry.

Research shows that web geometry, tension, and material properties
influence the transmission and filtering of vibrational information.

Orbweaver borrows the principle, not the literal geometry.

A software dependency map does **not** need to look like a circular
spider web.

A flow may be hierarchical:

``` text
A → B → C
        ├→ D
        └→ E
```

A relationship map may be radial:

``` text
       B
       │
   C ─ A ─ D
       │
       E
```

A timeline may be linear:

``` text
T1 ───── T2 ───── T3 ───── T4
```

An architecture view may use groups:

``` text
┌─────────────── APPLICATION ───────────────┐
│                                           │
│  API ─────→ Service ─────→ Worker         │
│   │                                       │
└───│───────────────────────────────────────┘
    │
    ▼
┌──────────────── DATA ─────────────────────┐
│ Database              Queue               │
└───────────────────────────────────────────┘
```

The biomimicry is not:

> Make every diagram look like a spider web.

It is:

> **Let structure be derived from what the relationships need to
> communicate.**

------------------------------------------------------------------------

# Biomimicry Principle #6 --- The Structure Can Adapt

Orb-weaving spiders build, maintain, repair, and adjust their webs.

Research also shows that spiders can influence sensory performance by
changing web geometry and tension.

The software parallel is important.

The semantic model should remain stable while its projection can change.

``` text
                  ┌─ hierarchical
                  │
Semantic Graph ───┼─ radial
                  │
                  ├─ timeline
                  │
                  └─ future layouts
```

The information does not need to be rewritten because the presentation
changes.

This is why Orbweaver separates:

``` text
Graph
  ↓
Layout
  ↓
Scene
  ↓
Renderer
```

A different layout engine should not require different source data.

A different renderer should not require a different semantic graph.

------------------------------------------------------------------------

# Biomimicry Principle #7 --- Different Threads Can Carry Different Meaning

An orb web is made from specialized silks with different mechanical
properties and functions.

Orbweaver similarly treats relationships as semantic rather than
visually identical lines.

An edge may mean:

``` text
flow
dependency
event
data
reference
recovery
causation
```

A node may mean:

``` text
process
decision
service
database
actor
queue
document
event
```

The semantic distinction exists before visual styling.

``` ts
{
  from: "api",
  to: "database",
  type: "data"
}
```

A renderer or theme can decide how `data` should appear.

Meaning remains upstream of appearance.

------------------------------------------------------------------------

# Biomimicry Principle #8 --- The Center Is Not Always the Point

The classic orb web suggests a central spider surrounded by radial
threads.

Orbweaver does not require a central node.

The important biological idea is **distributed structure feeding
intelligible information**, not literal centralization.

Depending on the semantic model, the important topology might be:

``` text
hierarchy
network
tree
chain
cluster
timeline
radial system
grouped architecture
```

Orbweaver should select or accept the layout appropriate to the
information.

The spider inspires the architecture.

It does not constrain the diagram shape.

------------------------------------------------------------------------

# From Biology to Software

  Orb-weaver biology           Orbweaver architecture
  ---------------------------- -------------------------------------------
  Web                          Semantic graph
  Junction                     Node
  Thread                       Edge
  Web topology                 Graph topology
  Different silk functions     Semantic node/edge types
  Web geometry                 Derived layout
  Vibration                    Information carried through relationships
  Vibration origin             Provenance
  Sensory interpretation       Inspection
  Remote sensing               Understanding distant relationships
  Web repair/reconfiguration   Re-layout / alternate projection
  Extended sensory system      Interactive visual information surface

The mapping is intentionally conceptual rather than literal.

------------------------------------------------------------------------

# Why Not Just "Graph"?

Because the ambition is larger than drawing nodes and edges.

A generic graph library can answer:

> Where should these boxes go?

Orbweaver should eventually help answer:

> What does this structure tell me?

That distinction drives features such as:

-   semantic node types,
-   semantic edge types,
-   provenance,
-   source identity,
-   inspection,
-   focus,
-   neighborhood discovery,
-   upstream/downstream tracing,
-   alternate projections,
-   accessible textual representations.

The goal is not simply prettier diagrams.

The goal is **semantic visual structure**.

------------------------------------------------------------------------

# Why Not Make the Spider the API?

Because biomimicry should clarify architecture, not create novelty
terminology.

Orbweaver's public API should say:

``` text
Graph
Node
Edge
Group
Annotation
Layout
Scene
Renderer
```

Not:

``` text
Web
Spider
Silk
Prey
Strand
Nest
```

The animal provides the design philosophy.

The software API should remain obvious to developers.

------------------------------------------------------------------------

# The Orbweaver Architecture

``` text
                     MEANING
                        │
                        ▼
              ┌──────────────────┐
              │  Semantic Graph  │
              │                  │
              │ nodes            │
              │ edges            │
              │ groups           │
              │ provenance       │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │      Layout      │
              │                  │
              │ geometry         │
              │ routing          │
              │ spacing          │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │      Scene       │
              │                  │
              │ positioned       │
              │ semantic objects │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │     Renderer     │
              │                  │
              │ SVG / future     │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ Visual Structure │
              │                  │
              │ inspect          │
              │ focus            │
              │ navigate         │
              │ understand       │
              └──────────────────┘
```

The semantics survive every stage.

------------------------------------------------------------------------

# The RECALL Connection

Orbweaver is designed to remain independent from RECALL at its core.

RECALL can consume it through the existing component/plugin model:

``` text
RECALL source
      │
      ▼
component contract
      │
      ▼
semantic adapter
      │
      ▼
Orbweaver Graph
      │
      ▼
layout + render
      │
      ▼
RECALL artifact
```

That creates an important division of responsibility:

> **RECALL components own the authoring contract. Orbweaver owns
> visualization mechanics.**

And another:

> **Orbweaver preserves source identity. RECALL interprets source
> identity.**

A RECALL author declares information and relationships.

Orbweaver turns those relationships into spatial structure.

RECALL publishes the result.

------------------------------------------------------------------------

# A Diagram Is a Projection, Not the Source

This is one of the most important ideas behind Orbweaver.

Suppose the source contains:

``` text
A depends on B
B depends on C
B depends on D
```

That information might be projected as:

### Diagram

``` text
A → B → C
    │
    └→ D
```

### Table

``` text
A  depends on  B
B  depends on  C
B  depends on  D
```

### Inspector

``` text
B

Upstream:
  A

Downstream:
  C
  D
```

The semantic relationships are the source of truth.

The diagram is one projection of them.

This fits naturally with RECALL's component-driven publishing model:

> **The source describes information; components choose its
> projection.**

Orbweaver adds spatial projection to that system.

------------------------------------------------------------------------

# The Orbweaver Test

When considering a feature, ask:

### Does it describe meaning or appearance?

If it describes appearance, it probably belongs downstream of the
semantic graph.

### Would changing SVG to another renderer require changing the graph?

If yes, the abstraction is leaking.

### Would changing the layout engine require changing author data?

If yes, geometry has leaked upstream.

### Can an unknown semantic type still render?

If no, the vocabulary is too closed.

### Can a rendered object still identify the semantic entity that produced it?

If no, identity has been lost.

### Can the structure be inspected rather than merely viewed?

If not, Orbweaver is drifting toward illustration instead of semantic
visualization.

------------------------------------------------------------------------

# The Deeper Biomimicry

The most interesting similarity between an orb web and Orbweaver is not
visual.

It is architectural.

The biological system follows roughly this pattern:

``` text
environmental event
       ↓
web interaction
       ↓
vibration propagates through structure
       ↓
structure filters / transmits information
       ↓
spider senses signal
       ↓
location and meaning are inferred
```

Orbweaver follows:

``` text
semantic information
       ↓
relationships
       ↓
graph topology
       ↓
layout creates visual structure
       ↓
user inspects structure
       ↓
relationships and origin become intelligible
```

In both cases:

> **The structure participates in understanding.**

That is the biomimicry.

------------------------------------------------------------------------

# The Mascot's Job

If Orbweaver eventually has a visual spider mascot, the character should
represent the philosophy rather than become decorative branding.

The spider is not there because:

> "Graphs look like webs."

The spider represents:

-   sensitivity to relationships,
-   awareness through structure,
-   precision,
-   distributed information gathering,
-   topology as intelligence,
-   deliberate construction,
-   adaptation,
-   source localization.

A suitable personality would therefore be less "cute spider" and more:

> **quiet systems architect who already felt the dependency break three
> nodes away.**

The web is the interface.

The spider understands the system because it understands the web.

------------------------------------------------------------------------

# One-Line Philosophy

> **Orbweaver turns relationships into structures you can reason
> through.**

------------------------------------------------------------------------

# Core Principle

> **Authors declare meaning. Orbweaver owns geometry.**

------------------------------------------------------------------------

# Biomimicry Principle

> **The visual is not a picture of the information. It is a structure
> through which the information travels.**

------------------------------------------------------------------------

# Project Identity

**Orbweaver**

*Semantic visual structures for declarative systems.*

For the RECALL ecosystem:

*Semantic visual structures for RECALL.*

------------------------------------------------------------------------

# Research Basis

The Orbweaver metaphor is inspired by real properties of orb-weaving
spider sensory systems rather than by the superficial appearance of a
web alone.

Useful background:

1.  Mortimer et al., **"Remote monitoring of vibrational information in
    spider webs"**, *The Science of Nature* (2018). The study describes
    the web as an extension of the spider's body and examines how
    vibration carries information through orb webs.\
    https://link.springer.com/article/10.1007/s00114-018-1561-1

2.  Mortimer, **"A Spider's Vibration Landscape: Adaptations to Promote
    Vibrational Information Transfer in Orb Webs"**, *Integrative and
    Comparative Biology* (2019). Reviews how geometry, silk properties,
    tension, and spider behavior influence vibrational information
    transfer.\
    https://pubmed.ncbi.nlm.nih.gov/31106817/

3.  Zhou et al., **"Outsourced hearing in an orb-weaving spider that
    uses its web as an auditory sensor"**, *PNAS* (2022). Demonstrates
    an orb web functioning as an extended acoustic sensing surface and
    shows that web geometry and pretension can affect responsiveness.\
    https://pmc.ncbi.nlm.nih.gov/articles/PMC9169088/

4.  **"Exploration of the Design of Spiderweb-Inspired Structures for
    Vibration-Driven Sensing"** (2023). Explores orb-web-inspired
    structures as large-area vibration-driven sensing systems.\
    https://pmc.ncbi.nlm.nih.gov/articles/PMC10046129/

These biological observations inspire Orbweaver's design philosophy.
They are not claims that the software reproduces spider neurobiology or
web mechanics.

------------------------------------------------------------------------

# Final Thought

An ordinary diagram says:

> **Here is a picture of the system.**

Orbweaver should say:

> **Here is the system's structure. Touch one part and understand what
> it connects to, where it came from, and how information moves through
> it.**

That is why the orb-weaver is more than a name.

It is the architectural metaphor.
