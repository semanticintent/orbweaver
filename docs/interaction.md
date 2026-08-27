# Interaction and inspection

Orbweaver separates semantic interaction primitives from the consuming
application's interaction experience.

The core package owns:

- stable entity references;
- incoming, outgoing, incident, neighbor, and group-membership queries;
- provenance-aware inspection payloads;
- selected, related, and muted SVG states;
- pointer and keyboard event handling;
- controller cleanup.

The host owns the inspector UI, source viewer, navigation behavior, and how
inspection participates in the surrounding artifact.

## Mounting interaction

```ts
import {
  layoutGraph,
  mountSvgInteraction,
  renderSvg,
} from '@semanticintent/orbweaver'

const scene = await layoutGraph(graph)
container.innerHTML = renderSvg(scene)

const svg = container.querySelector('svg')
if (svg) {
  const interaction = mountSvgInteraction(svg, scene.graph, {
    onSelectionChange(inspection) {
      renderInspector(inspection)
    },
  })

  // When the host removes the diagram:
  interaction.destroy()
}
```

Nodes and groups support pointer selection and keyboard selection with Enter or
Space. Escape clears the current selection. Background clicks also clear it.

## Inspection contract

Inspection payloads contain semantic data rather than SVG elements. A node
inspection includes its incoming and outgoing edge IDs, neighboring node IDs,
metadata, and provenance. Edge inspection includes its endpoints. Group
inspection includes recursively contained nodes.

This boundary allows a future RECALL host to interpret a generic Orbweaver
`source` object as a source-navigation action without adding RECALL behavior to
Orbweaver core.

## Lightweight viewport navigation

`mountSvgViewport` adds bounded navigation directly to the root SVG `viewBox`.
It does not wrap or transform the diagram, modify semantic geometry, or add a
runtime dependency.

```ts
import { mountSvgViewport } from '@semanticintent/orbweaver'

const viewport = mountSvgViewport(svg, {
  minZoom: 1,
  maxZoom: 4,
  onViewChange(state) {
    updateZoomLabel(Math.round(state.zoom * 100))
  },
})

viewport.zoomIn()
viewport.zoomOut()
viewport.fit()

// When the host removes the diagram:
viewport.destroy()
```

The default behavior preserves ordinary page scrolling. Users can zoom with
host controls, `+`, `-`, `0`, `Ctrl/Command + wheel`, or a two-pointer pinch.
Panning uses Space + primary-button drag, middle-button drag, or two-pointer
movement while zoomed. Space-drag activates while the pointer is over the SVG;
the SVG does not need keyboard focus first. Zoom is limited to 100–400% by
default, and `fit()` restores the SVG's original `viewBox` exactly.

Fullscreen remains a host responsibility because the application—not the SVG
renderer—owns the surrounding controls, inspector, and escape behavior.
