import { describe, expect, it } from 'vitest'
import {
  getSemanticLensRecipe,
  layoutGraph,
  recommendSemanticDetailLevel,
  renderSvg,
  type Graph,
} from '../src/index.js'

const detailedGraph: Graph = {
  id: 'semantic-detail',
  title: 'Semantic detail',
  groups: [{ id: 'control', label: 'Control plane', description: 'Policy and coordination boundary.' }],
  nodes: [
    { id: 'request', type: 'document', label: 'Customer request', group: 'control', description: 'The declared customer intent.' },
    { id: 'validate', type: 'process', label: 'Validate intent', group: 'control', status: 'warning', description: 'Checks policy and supporting evidence.' },
  ],
  edges: [{ id: 'classify', from: 'request', to: 'validate', type: 'request', label: 'Classify' }],
  annotations: [
    { id: 'context', target: { kind: 'node', id: 'request' }, type: 'evidence', severity: 'info', body: 'Declared in source.' },
    { id: 'risk', target: { kind: 'node', id: 'validate' }, type: 'risk', severity: 'critical', body: 'A failed check blocks publication.' },
  ],
}

describe('semantic detail', () => {
  it('recommends deterministic levels from documented defaults and custom thresholds', () => {
    expect(recommendSemanticDetailLevel(0.75)).toBe('overview')
    expect(recommendSemanticDetailLevel(1.2)).toBe('standard')
    expect(recommendSemanticDetailLevel(1.99)).toBe('standard')
    expect(recommendSemanticDetailLevel(2)).toBe('close')
    expect(recommendSemanticDetailLevel(1.5, { overviewBelow: 1.6, closeAt: 3 })).toBe('overview')
    expect(() => recommendSemanticDetailLevel(0)).toThrow(RangeError)
    expect(() => recommendSemanticDetailLevel(1, { overviewBelow: 2, closeAt: 2 })).toThrow(RangeError)
  })

  it('renders explicit disclosure states without changing scene geometry', async () => {
    const scene = await layoutGraph(detailedGraph)
    const overview = renderSvg(scene, { detailLevel: 'overview' })
    const standard = renderSvg(scene)
    const close = renderSvg(scene, { detailLevel: 'close' })
    const viewBox = standard.match(/viewBox="[^"]+"/)?.[0]

    expect(overview.match(/viewBox="[^"]+"/)?.[0]).toBe(viewBox)
    expect(close.match(/viewBox="[^"]+"/)?.[0]).toBe(viewBox)
    expect(overview).toContain('class="orbweaver ow-detail-overview"')
    expect(standard).toContain('class="orbweaver ow-detail-standard"')
    expect(close).toContain('class="orbweaver ow-detail-close"')
    expect(overview).toContain('data-detail-level="overview"')
    expect(standard).toContain('Standard semantic detail active.')
    expect(close).toContain('class="ow-node-detail"')
    expect(close).toContain('The declared customer intent.')
    expect(close).toContain('Policy and coordination boundary.')
    expect(close).toContain('Classify · requ…')
  })

  it('keeps all entities accessible while overview visually reserves markers for critical signals', async () => {
    const scene = await layoutGraph(detailedGraph)
    const overview = renderSvg(scene, { detailLevel: 'overview' })

    expect(overview).toContain('data-node-id="request"')
    expect(overview).toContain('data-node-id="validate"')
    expect(overview).toContain('Evidence: Declared in source.')
    expect(overview).toContain('Risk: A failed check blocks publication.')
    expect(overview).not.toContain('data-annotation-type="evidence"')
    expect(overview).toContain('data-annotation-type="risk" data-annotation-severity="critical"')
  })

  it('composes semantic detail with semantic lenses', async () => {
    const scene = await layoutGraph(detailedGraph)
    const svg = renderSvg(scene, { detailLevel: 'overview', lens: getSemanticLensRecipe('risk') })

    expect(svg).toContain('class="orbweaver ow-detail-overview ow-lens-active"')
    expect(svg).toContain('data-detail-level="overview" data-lens-id="risk"')
    expect(svg).toContain('Overview semantic detail active. Risk lens active.')
  })
})
