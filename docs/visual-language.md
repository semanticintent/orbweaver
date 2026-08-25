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

Unknown types retain the generic treatment. These mappings are renderer
defaults, not graph semantics.

## Accessibility

SVG output includes a title, description, textual graph summary, focusable
nodes, accessible node names, meaningful list roles, and visible focus states.
Essential meaning must remain available without hover or color perception.
