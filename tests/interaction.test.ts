// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  deriveLensProjection,
  derivePathNarrative,
  getSemanticLensRecipe,
  getPathNarrativeRecipe,
  layoutGraph,
  mountSvgInteraction,
  mountSvgViewport,
  renderSvg,
  type Graph,
  type Inspection,
} from '../src/index.js'

const graph: Graph = {
  id: 'interaction',
  groups: [{ id: 'application', label: 'Application' }],
  nodes: [
    { id: 'a', label: 'A', group: 'application', source: { file: 'flow.rcl', line: 10 } },
    { id: 'b', label: 'B', group: 'application' },
    { id: 'c', label: 'C' },
    { id: 'isolated', label: 'Isolated' },
  ],
  edges: [
    { id: 'a-b', from: 'a', to: 'b' },
    { id: 'b-c', from: 'b', to: 'c' },
  ],
}

async function setup(
  onSelectionChange = vi.fn<(inspection: Inspection | undefined) => void>(),
  initialSelection?: { kind: 'node' | 'edge' | 'group'; id: string },
) {
  const scene = await layoutGraph(graph)
  const parsed = new DOMParser().parseFromString(renderSvg(scene), 'image/svg+xml')
  const svg = document.importNode(parsed.documentElement, true)
  document.body.append(svg)
  if (!(svg instanceof SVGSVGElement)) throw new Error('Rendered SVG was not mounted.')
  const controller = mountSvgInteraction(svg, scene.graph, {
    onSelectionChange,
    ...(initialSelection === undefined ? {} : { initialSelection }),
  })
  return { svg, controller, onSelectionChange }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('SVG interaction controller', () => {
  it('selects a node, emphasizes its neighborhood, and exposes provenance', async () => {
    const { svg, controller, onSelectionChange } = await setup()
    const selected = svg.querySelector<SVGElement>('[data-node-id="a"]')
    selected?.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(controller.selected).toEqual({ kind: 'node', id: 'a' })
    expect(selected?.hasAttribute('data-selected')).toBe(true)
    expect(svg.querySelector('[data-node-id="b"]')?.hasAttribute('data-related')).toBe(true)
    expect(svg.querySelector('[data-edge-id="a-b"]')?.hasAttribute('data-related')).toBe(true)
    expect(svg.querySelector('[data-node-id="isolated"]')?.hasAttribute('data-muted')).toBe(true)
    expect(onSelectionChange).toHaveBeenLastCalledWith(expect.objectContaining({
      kind: 'node',
      id: 'a',
      source: { file: 'flow.rcl', line: 10 },
    }))
  })

  it('supports Enter/Space selection and Escape clearing', async () => {
    const { svg, controller } = await setup()
    const node = svg.querySelector<SVGElement>('[data-node-id="b"]')
    node?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    expect(controller.selected).toEqual({ kind: 'node', id: 'b' })

    node?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(controller.selected).toBeUndefined()
    expect(svg.classList.contains('ow-has-selection')).toBe(false)
  })

  it('selects edges and groups through their semantic identifiers', async () => {
    const { svg, controller } = await setup()
    svg.querySelector('[data-edge-id="b-c"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(controller.selected).toEqual({ kind: 'edge', id: 'b-c' })

    svg.querySelector('[data-group-id="application"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(controller.selected).toEqual({ kind: 'group', id: 'application' })
    expect(svg.querySelector('[data-node-id="a"]')?.hasAttribute('data-related')).toBe(true)
  })

  it('selects consecutive solid and dashed relationships through wide hit paths', async () => {
    const relationshipGraph: Graph = {
      id: 'relationship-hit-targets',
      nodes: [
        { id: 'source', label: 'Source' },
        { id: 'process', label: 'Process' },
        { id: 'events', label: 'Events' },
      ],
      edges: [
        { id: 'reserve', from: 'source', to: 'process', type: 'dependency', label: 'Reserve' },
        { id: 'publish', from: 'process', to: 'events', type: 'event', label: 'Publish' },
      ],
    }
    const scene = await layoutGraph(relationshipGraph)
    const parsed = new DOMParser().parseFromString(renderSvg(scene), 'image/svg+xml')
    const svg = document.importNode(parsed.documentElement, true)
    document.body.append(svg)
    if (!(svg instanceof SVGSVGElement)) throw new Error('Rendered SVG was not mounted.')
    const onSelectionChange = vi.fn<(inspection: Inspection | undefined) => void>()
    const controller = mountSvgInteraction(svg, scene.graph, { onSelectionChange })

    svg.querySelector('[data-edge-id="reserve"] .ow-edge-hit')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(controller.selected).toEqual({ kind: 'edge', id: 'reserve' })
    svg.querySelector('[data-edge-id="publish"] .ow-edge-hit')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(controller.selected).toEqual({ kind: 'edge', id: 'publish' })
    expect(onSelectionChange).toHaveBeenLastCalledWith(expect.objectContaining({
      kind: 'edge',
      id: 'publish',
      from: 'process',
      to: 'events',
      type: 'event',
    }))
    expect(svg.querySelector('[data-node-id="process"]')?.hasAttribute('data-related')).toBe(true)
    expect(svg.querySelector('[data-node-id="events"]')?.hasAttribute('data-related')).toBe(true)
  })

  it('clears on background click and removes listeners on destroy', async () => {
    const { svg, controller, onSelectionChange } = await setup()
    controller.select({ kind: 'node', id: 'a' })
    svg.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(controller.selected).toBeUndefined()

    controller.destroy()
    const calls = onSelectionChange.mock.calls.length
    svg.querySelector('[data-node-id="b"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(onSelectionChange).toHaveBeenCalledTimes(calls)
    expect(controller.select({ kind: 'node', id: 'b' })).toBeUndefined()
    expect(controller.selected).toBeUndefined()
    controller.destroy()
    expect(onSelectionChange).toHaveBeenCalledTimes(calls)
  })

  it('restores stable node, edge, and group selections and ignores a missing one', async () => {
    const refs = [
      { kind: 'node' as const, id: 'a' },
      { kind: 'edge' as const, id: 'a-b' },
      { kind: 'group' as const, id: 'application' },
    ]
    for (const ref of refs) {
      const restored = await setup(vi.fn(), ref)
      expect(restored.controller.selected).toEqual(ref)
      expect(restored.svg.querySelector(`[data-${ref.kind}-id="${ref.id}"]`)?.hasAttribute('data-selected')).toBe(true)
    }

    const missing = await setup(vi.fn(), { kind: 'node', id: 'removed-node' })
    expect(missing.controller.selected).toBeUndefined()
    expect(missing.svg.classList.contains('ow-has-selection')).toBe(false)
  })

  it('preserves relationship selection and connected emphasis across zoom and fit', async () => {
    const { svg, controller } = await setup()
    Object.defineProperty(svg, 'getBoundingClientRect', {
      value: () => ({ x: 0, y: 0, left: 0, top: 0, right: 320, bottom: 180, width: 320, height: 180 }),
    })
    const viewport = mountSvgViewport(svg)
    viewport.setZoom(4, { x: 280, y: 90 })

    svg.querySelector('[data-edge-id="a-b"] .ow-edge-hit')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(controller.selected).toEqual({ kind: 'edge', id: 'a-b' })
    expect(svg.querySelector('[data-node-id="a"]')?.hasAttribute('data-related')).toBe(true)
    expect(svg.querySelector('[data-node-id="b"]')?.hasAttribute('data-related')).toBe(true)

    viewport.fit()
    expect(controller.selected).toEqual({ kind: 'edge', id: 'a-b' })
    expect(svg.querySelector('[data-edge-id="a-b"]')?.hasAttribute('data-selected')).toBe(true)
    viewport.destroy()
    expect(controller.selected).toEqual({ kind: 'edge', id: 'a-b' })
  })

  it('keeps independently mounted diagrams isolated', async () => {
    const first = await setup()
    const second = await setup()
    first.controller.select({ kind: 'node', id: 'a' })
    second.controller.select({ kind: 'edge', id: 'b-c' })

    expect(first.controller.selected).toEqual({ kind: 'node', id: 'a' })
    expect(second.controller.selected).toEqual({ kind: 'edge', id: 'b-c' })
    expect(first.svg.querySelector('[data-node-id="a"]')?.hasAttribute('data-selected')).toBe(true)
    expect(first.svg.querySelector('[data-edge-id="b-c"]')?.hasAttribute('data-selected')).toBe(false)
    expect(second.svg.querySelector('[data-edge-id="b-c"]')?.hasAttribute('data-selected')).toBe(true)

    first.controller.destroy()
    expect(second.controller.selected).toEqual({ kind: 'edge', id: 'b-c' })
    expect(second.svg.querySelector('[data-edge-id="b-c"]')?.hasAttribute('data-selected')).toBe(true)
  })

  it('can retain unrelated entities at full opacity', async () => {
    const scene = await layoutGraph(graph)
    const parsed = new DOMParser().parseFromString(renderSvg(scene), 'image/svg+xml')
    const svg = document.importNode(parsed.documentElement, true)
    document.body.append(svg)
    if (!(svg instanceof SVGSVGElement)) throw new Error('Rendered SVG was not mounted.')
    const controller = mountSvgInteraction(svg, scene.graph, { muteUnrelated: false })
    controller.select({ kind: 'node', id: 'a' })
    expect(svg.querySelector('[data-node-id="isolated"]')?.hasAttribute('data-muted')).toBe(false)
  })

  it('includes active lens reasons in keyboard and pointer inspection', async () => {
    const scene = await layoutGraph({
      ...graph,
      nodes: graph.nodes.map((node) => node.id === 'a' ? { ...node, status: 'warning' } : node),
    })
    const lens = getSemanticLensRecipe('risk')
    const projection = deriveLensProjection(scene.graph, lens)
    const parsed = new DOMParser().parseFromString(renderSvg(scene, { lens }), 'image/svg+xml')
    const svg = document.importNode(parsed.documentElement, true)
    document.body.append(svg)
    if (!(svg instanceof SVGSVGElement)) throw new Error('Rendered SVG was not mounted.')
    const controller = mountSvgInteraction(svg, scene.graph, { lensProjection: projection })

    expect(controller.select({ kind: 'node', id: 'a' })?.lens).toMatchObject({
      id: 'risk', label: 'Risk', role: 'match',
    })
    expect(controller.select({ kind: 'node', id: 'isolated' })?.lens).toMatchObject({
      id: 'risk', role: 'background', reasons: [],
    })
  })

  it('advances and reverses an active narrative with keyboard-equivalent controller steps', async () => {
    const scene = await layoutGraph(graph)
    const narrative = derivePathNarrative(scene.graph, 'a', getPathNarrativeRecipe('downstream'))
    const parsed = new DOMParser().parseFromString(renderSvg(scene, { narrative }), 'image/svg+xml')
    const svg = document.importNode(parsed.documentElement, true)
    document.body.append(svg)
    if (!(svg instanceof SVGSVGElement)) throw new Error('Rendered SVG was not mounted.')
    const controller = mountSvgInteraction(svg, scene.graph, { narrativeProjection: narrative })

    controller.select({ kind: 'node', id: 'a' })
    expect(controller.narrativeStep).toBe(-1)
    expect(controller.nextNarrativeStep()?.id).toBe('b')
    expect(controller.narrativeStep).toBe(0)
    expect(controller.nextNarrativeStep()?.id).toBe('c')
    expect(controller.previousNarrativeStep()?.id).toBe('b')
    expect(controller.previousNarrativeStep()?.id).toBe('a')
    controller.clear()
    expect(controller.narrativeStep).toBeUndefined()
  })
})
