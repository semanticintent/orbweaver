import { describe, expect, it } from 'vitest'
import { deriveLegend, deriveLensProjection, derivePathNarrative, getPathNarrativeRecipe, getSemanticLensRecipe, layoutGraph, normalizeGraph, renderSvg, type Graph } from '../src/index.js'

const graph: Graph = {
  id: 'legend',
  title: 'Generated legend',
  groups: [{ id: 'system', label: 'System' }],
  nodes: [
    { id: 'api', label: 'API', type: 'service', group: 'system', status: 'warning' },
    { id: 'store', label: 'Store', type: 'database', group: 'system' },
    { id: 'custom', label: 'Custom', type: 'policy engine' },
  ],
  edges: [
    { id: 'read', from: 'api', to: 'store', type: 'data' },
    { id: 'evaluate', from: 'api', to: 'custom', type: 'request' },
  ],
  annotations: [
    { id: 'risk', target: { kind: 'node', id: 'api' }, type: 'risk', body: 'Capacity risk.' },
    { id: 'evidence', target: { kind: 'edge', id: 'read' }, type: 'evidence', body: 'Declared flow.' },
  ],
}

describe('generated legends', () => {
  it('derives only present vocabulary in stable graph order', () => {
    const normalized = normalizeGraph(graph)
    const legend = deriveLegend(normalized)
    expect(legend.sections.map((section) => section.id)).toEqual(['entities', 'groups', 'relationships', 'statuses', 'annotations'])
    expect(legend.sections[0]?.items).toEqual([
      { id: 'service', label: 'Service', count: 1 },
      { id: 'database', label: 'Database', count: 1 },
      { id: 'policy engine', label: 'Policy engine', count: 1 },
    ])
    expect(legend.summary).not.toContain('Critical')
    expect(legend.summary).toContain('Risk (1)')
  })

  it('includes only active view state when supplied', () => {
    const normalized = normalizeGraph(graph)
    const lens = deriveLensProjection(normalized, getSemanticLensRecipe('risk'))
    const narrative = derivePathNarrative(normalized, 'api', getPathNarrativeRecipe('downstream'))
    const legend = deriveLegend(normalized, { lens, detailLevel: 'close', narrative })
    expect(legend.sections.at(-1)).toEqual({
      id: 'view', label: 'Active view', items: [
        { id: 'Risk lens', label: 'Risk lens', count: 1 },
        { id: 'close detail', label: 'Close detail', count: 1 },
        { id: 'Downstream impact', label: 'Downstream impact', count: 1 },
      ],
    })
  })

  it('renders an optional accessible legend outside unchanged scene geometry', async () => {
    const scene = await layoutGraph(graph)
    const baseline = renderSvg(scene, { responsive: false })
    const svg = renderSvg(scene, { responsive: false, includeLegend: true })
    expect(svg).toContain('data-legend="generated"')
    expect(svg).toContain('class="ow-legend"')
    expect(svg).toContain('GENERATED LEGEND · PRESENT SEMANTICS ONLY')
    expect(svg).toContain('aria-label="Generated legend with')
    expect(svg).toContain('Policy engine (1)')
    expect(svg).toContain(`class="ow-scene"`)
    expect(svg).toContain(`width="${scene.width}" height="${scene.height + 212}"`)
    expect(svg).toContain('class="ow-legend-summary"')
    expect(baseline).toContain(`width="${scene.width}" height="${scene.height}"`)
  })

  it('omits empty categories and escapes custom vocabulary', () => {
    const normalized = normalizeGraph({ id: 'custom', nodes: [{ id: 'a', label: 'A', type: '<script>' }], edges: [] })
    const legend = deriveLegend(normalized)
    expect(legend.sections.map((section) => section.id)).toEqual(['entities'])
    return layoutGraph(normalized).then((scene) => {
      const svg = renderSvg(scene, { includeLegend: true })
      expect(svg).not.toContain('<script>')
      expect(svg).toContain('&lt;script&gt; (1)')
    })
  })
})
