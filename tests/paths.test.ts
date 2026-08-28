import { describe, expect, it } from 'vitest'
import { derivePathNarrative, getPathNarrativeMatch, getPathNarrativeRecipe, inspectEntity, layoutGraph, normalizeGraph, renderSvg, type Graph } from '../src/index.js'

const graph: Graph = {
  id: 'narratives',
  nodes: [
    { id: 'request', label: 'Request' }, { id: 'validate', label: 'Validate' },
    { id: 'reserve', label: 'Reserve' }, { id: 'publish', label: 'Publish' },
    { id: 'external', label: 'Provider', type: 'external' }, { id: 'isolated', label: 'Isolated' },
  ],
  edges: [
    { id: 'request-validate', from: 'request', to: 'validate', type: 'request' },
    { id: 'validate-reserve', from: 'validate', to: 'reserve', type: 'data' },
    { id: 'reserve-publish', from: 'reserve', to: 'publish', type: 'event' },
    { id: 'publish-validate', from: 'publish', to: 'validate', type: 'event' },
    { id: 'validate-provider', from: 'validate', to: 'external', metadata: { trustBoundary: true } },
    { id: 'reserve-failure', from: 'reserve', to: 'external', type: 'failure' },
    { id: 'self', from: 'request', to: 'request' },
  ],
}

describe('focused path narratives', () => {
  const normalized = normalizeGraph(graph)

  it('derives stable downstream breadth-first steps across cycles and self-edges', () => {
    const first = derivePathNarrative(normalized, 'request', getPathNarrativeRecipe('downstream'))
    const second = derivePathNarrative(normalized, 'request', getPathNarrativeRecipe('downstream'))
    expect(second).toEqual(first)
    expect(first.steps.map((step) => `${step.depth}:${step.from}->${step.to}`)).toEqual([
      '1:request->validate', '2:validate->reserve', '2:validate->external', '3:reserve->publish',
    ])
    expect(first.truncated).toBe(false)
    expect(getPathNarrativeMatch(first, { kind: 'node', id: 'request' })?.role).toBe('start')
    expect(getPathNarrativeMatch(first, { kind: 'node', id: 'isolated' })?.role).toBe('background')
  })

  it('supports upstream traversal and filtered semantic recipes', () => {
    expect(derivePathNarrative(normalized, 'publish', getPathNarrativeRecipe('upstream')).steps.map((step) => step.to)).toEqual(['reserve', 'validate', 'request'])
    expect(derivePathNarrative(normalized, 'reserve', getPathNarrativeRecipe('data-lineage')).steps.map((step) => step.edgeId)).toEqual(['validate-reserve', 'reserve-publish'])
    expect(derivePathNarrative(normalized, 'reserve', getPathNarrativeRecipe('failure-propagation')).steps.map((step) => step.edgeId)).toEqual(['reserve-failure'])
    expect(derivePathNarrative(normalized, 'validate', getPathNarrativeRecipe('trust-crossings')).steps.map((step) => step.edgeId)).toEqual(['validate-provider', 'reserve-failure'])
  })

  it('reports explicit deterministic truncation diagnostics', () => {
    const depth = derivePathNarrative(normalized, 'request', getPathNarrativeRecipe('downstream'), { maxDepth: 1 })
    expect(depth.truncated).toBe(true)
    expect(depth.diagnostics).toEqual([{ code: 'max-depth', message: 'Narrative stopped at depth 1.' }])
    expect(depth.summary).toContain('Narrative stopped at depth 1.')

    const steps = derivePathNarrative(normalized, 'request', getPathNarrativeRecipe('downstream'), { maxSteps: 1 })
    expect(steps.diagnostics).toEqual([{ code: 'max-steps', message: 'Narrative stopped after 1 steps.' }])
  })

  it('rejects invalid starts and resource bounds', () => {
    expect(() => derivePathNarrative(normalized, 'missing', getPathNarrativeRecipe('downstream'))).toThrow(RangeError)
    expect(() => derivePathNarrative(normalized, 'request', getPathNarrativeRecipe('downstream'), { maxDepth: 0 })).toThrow(RangeError)
  })

  it('renders and inspects an accessible narrative without changing geometry', async () => {
    const scene = await layoutGraph(graph)
    const narrative = derivePathNarrative(scene.graph, 'request', getPathNarrativeRecipe('downstream'))
    const baseline = renderSvg(scene)
    const svg = renderSvg(scene, { narrative })

    expect(svg).toContain('class="orbweaver ow-detail-standard ow-path-active"')
    expect(svg).toContain('data-path-id="downstream" data-path-start="request"')
    expect(svg).toContain('data-node-id="request" data-node-type="generic" data-node-status="default" data-path-role="start"')
    expect(svg).toContain('data-edge-id="request-validate" data-edge-type="request" data-path-role="step" data-path-steps="0"')
    expect(svg).toContain('class="ow-path-summary">Downstream impact from Request:')
    expect(svg.match(/viewBox="[^"]+"/)?.[0]).toBe(baseline.match(/viewBox="[^"]+"/)?.[0])
    expect(inspectEntity(scene.graph, { kind: 'node', id: 'validate' }, undefined, narrative)?.narrative).toMatchObject({
      id: 'downstream', role: 'step', stepIndexes: [0, 1, 2],
    })
  })
})
