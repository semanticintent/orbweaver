import {
  layoutGraph,
  mountSvgInteraction,
  mountSvgViewport,
  renderSvg,
  type Graph,
  type SvgInteractionController,
  type SvgViewportController,
} from '../../src/index.js'

const graph: Graph = {
  id: 'browser-quality',
  title: 'Browser quality workflow',
  description: 'A real-browser interaction and accessibility fixture.',
  groups: [{ id: 'platform', label: 'Platform' }],
  nodes: [
    { id: 'request', type: 'document', label: 'Customer request', group: 'platform' },
    { id: 'validate', type: 'process', label: 'Validate intent', group: 'platform' },
    { id: 'artifact', type: 'document', label: 'Rendered artifact' },
  ],
  edges: [
    { id: 'validation', from: 'request', to: 'validate', type: 'flow', label: 'Validate' },
    { id: 'rendering', from: 'validate', to: 'artifact', type: 'dependency', label: 'Render' },
  ],
}

interface BrowserHarness {
  interaction?: SvgInteractionController
  viewport?: SvgViewportController
}

const harness: BrowserHarness = {}

async function mount(): Promise<void> {
  const scene = await layoutGraph(graph)
  const host = document.querySelector<HTMLElement>('#diagram')
  if (host === null) throw new Error('Browser fixture host is missing.')
  host.innerHTML = renderSvg(scene)
  const svg = host.querySelector('svg')
  if (!(svg instanceof SVGSVGElement)) throw new Error('Orbweaver SVG was not mounted.')
  harness.interaction = mountSvgInteraction(svg, scene.graph)
  harness.viewport = mountSvgViewport(svg)
}

Object.assign(globalThis, { orbweaverBrowserTest: { graph, harness, mount } })

