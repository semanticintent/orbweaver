# Visual language

Orbweaver's default visual language is neutral, precise, and information-dense
without feeling mechanical. It should belong comfortably inside technical
documentation, published analysis, and application interfaces.

## Principles

1. Topology remains visually primary.
2. Nodes use restrained surfaces and semantic details rather than ornamental
   illustration.
3. Edge routing, arrowheads, and labels remain legible at ordinary document
   scale.
4. Groups establish context without overpowering their contents.
5. Status is never communicated by color alone.
6. Light and dark themes share hierarchy, spacing, and contrast behavior.
7. Host systems can replace presentation tokens without modifying graph data.

## Semantic defaults

- Generic entities use elevated rounded surfaces.
- Processes and services receive a narrow accent rail.
- Decisions use clipped decision surfaces.
- Documents use a folded-corner surface.
- Databases use a datastore surface.
- Event relationships use a dashed route.
- Error relationships and critical nodes use the danger token.
- Semantic annotations use compact, derived markers: `§` constraint, `!` risk,
  `◆` decision, `◇` evidence, `?` assumption, `Δ` change, and `·` note.
- Multiple annotations on one entity collapse into a count marker so topology
  remains primary. Warning and critical severity use existing theme tokens.

Unknown types retain the generic treatment. These mappings are renderer
defaults, not graph semantics.

## Progressive semantic detail

Annotations form a restrained bridge between topology and the semantic
inspector. At overview scale the marker answers “why should I look closer?”
without expanding node geometry. Focus and inspection expose the full annotation
body, provenance, and metadata. A future close-view presentation may reveal a
single concise summary, but essential meaning must never depend on zoom or
hover alone.

Authors declare annotation meaning and targets. They do not specify marker
coordinates, symbols, colors, expansion dimensions, or visibility breakpoints.

## Accessibility

SVG output includes a title, description, textual graph summary, focusable
nodes and edges, accessible entity names including annotation detail,
meaningful list roles, and visible focus states.
Essential meaning must remain available without hover or color perception.
