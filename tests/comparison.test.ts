import { describe, expect, it } from 'vitest'
import { compareArchitectures, getArchitectureComparisonEntry, layoutGraph, normalizeGraph, renderSvg, type Graph } from '../src/index.js'

const current: Graph = {
  id: 'commerce-current', title: 'Current commerce architecture',
  groups: [{ id: 'services', label: 'Services', type: 'domain' }, { id: 'legacy', label: 'Legacy' }],
  nodes: [
    { id: 'checkout', label: 'Checkout', type: 'service', group: 'services', status: 'warning', metadata: { owner: 'Commerce' } },
    { id: 'inventory', label: 'Inventory', type: 'service', group: 'services' },
    { id: 'legacy-orders', label: 'Legacy orders', type: 'database', group: 'legacy' },
  ],
  edges: [
    { id: 'reserve', from: 'checkout', to: 'inventory', type: 'request' },
    { id: 'persist', from: 'checkout', to: 'legacy-orders', type: 'data' },
  ],
  annotations: [{ id: 'checkout-risk', target: { kind: 'node', id: 'checkout' }, type: 'risk', body: 'Legacy coupling.' }],
}

const target: Graph = {
  id: 'commerce-target', title: 'Target commerce architecture',
  groups: [{ id: 'services', label: 'Domain services', type: 'domain' }],
  nodes: [
    { id: 'checkout', label: 'Checkout', type: 'service', group: 'services', status: 'healthy', metadata: { owner: 'Commerce' } },
    { id: 'inventory', label: 'Inventory', type: 'service', group: 'services' },
    { id: 'order-service', label: 'Order service', type: 'service', group: 'services' },
  ],
  edges: [
    { id: 'reserve', from: 'checkout', to: 'inventory', type: 'request' },
    { id: 'persist-v2', from: 'checkout', to: 'order-service', type: 'data' },
  ],
  annotations: [{ id: 'checkout-decision', target: { kind: 'node', id: 'checkout' }, type: 'decision', body: 'Remove legacy coupling.' }],
}

describe('architecture comparison', () => {
  it('matches stable IDs and derives deterministic target-first states', () => {
    const base = normalizeGraph(current)
    const next = normalizeGraph(target)
    const first = compareArchitectures(base, next)
    expect(compareArchitectures(base, next)).toEqual(first)
    expect(first.entries.map((entry) => `${entry.entity.kind}:${entry.entity.id}:${entry.state}`)).toEqual([
      'node:checkout:changed', 'node:inventory:unchanged', 'node:order-service:introduced', 'node:legacy-orders:removed',
      'edge:reserve:unchanged', 'edge:persist-v2:introduced', 'edge:persist:removed',
      'group:services:changed', 'group:legacy:removed',
    ])
    expect(first.counts).toEqual({ unchanged: 2, introduced: 2, removed: 3, changed: 2 })
    expect(first.summary).toContain('Removed: Legacy orders, persist, Legacy.')
  })

  it('reports inspectable field and annotation changes without guessing renames', () => {
    const comparison = compareArchitectures(normalizeGraph(current), normalizeGraph(target))
    expect(getArchitectureComparisonEntry(comparison, { kind: 'node', id: 'checkout' })?.changes.map((change) => change.field)).toEqual(['status', 'annotations'])
    expect(getArchitectureComparisonEntry(comparison, { kind: 'group', id: 'services' })?.changes).toEqual([{ field: 'label', before: 'Services', after: 'Domain services' }])
    expect(getArchitectureComparisonEntry(comparison, { kind: 'node', id: 'legacy-orders' })?.before).toMatchObject({ label: 'Legacy orders' })
    expect(getArchitectureComparisonEntry(comparison, { kind: 'node', id: 'order-service' })?.state).toBe('introduced')
  })

  it('does not mutate either normalized graph', () => {
    const base = normalizeGraph(current)
    const next = normalizeGraph(target)
    const beforeBase = structuredClone(base)
    const beforeNext = structuredClone(next)
    compareArchitectures(base, next)
    expect(base).toEqual(beforeBase)
    expect(next).toEqual(beforeNext)
  })

  it('renders an accessible target overlay while preserving removed semantics in metadata', async () => {
    const comparison = compareArchitectures(normalizeGraph(current), normalizeGraph(target))
    const scene = await layoutGraph(target)
    const baseline = renderSvg(scene)
    const svg = renderSvg(scene, { comparison, includeLegend: true })
    expect(svg).toContain('class="orbweaver ow-detail-standard ow-comparison-active"')
    expect(svg).toContain('data-comparison-base="commerce-current" data-comparison-target="commerce-target"')
    expect(svg).toContain('data-node-id="checkout" data-node-type="service" data-node-status="healthy" data-comparison-state="changed"')
    expect(svg).toContain('data-node-id="order-service" data-node-type="service" data-node-status="default" data-comparison-state="introduced"')
    expect(svg).toContain('Changed in the target architecture: status, annotations.')
    expect(svg).toContain('class="ow-comparison"')
    expect(svg).toContain('Legacy orders')
    expect(svg).toContain('Architecture comparison (1)')
    expect(svg.match(/class="ow-scene"[^>]*>.*?<rect class="ow-canvas" width="[^"]+" height="[^"]+"/s)?.[0]).toBe(
      baseline.match(/class="ow-scene"[^>]*>.*?<rect class="ow-canvas" width="[^"]+" height="[^"]+"/s)?.[0],
    )
    expect(() => renderSvg(scene, { comparison: { ...comparison, targetGraphId: 'wrong' } })).toThrow(RangeError)
  })
})
