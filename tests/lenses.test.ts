import { describe, expect, it } from 'vitest'
import {
  deriveLensProjection,
  getLensMatch,
  getSemanticLensRecipe,
  inspectEntity,
  layoutGraph,
  normalizeGraph,
  renderSvg,
  type Graph,
  type SemanticLens,
} from '../src/index.js'
import { fixtures } from './fixtures.js'

const architecture: Graph = {
  id: 'lens-architecture',
  title: 'Lens architecture',
  groups: [
    { id: 'channels', label: 'Channels' },
    { id: 'services', label: 'Services', metadata: { owner: 'Platform' } },
    { id: 'external', label: 'External systems' },
  ],
  nodes: [
    { id: 'storefront', type: 'service', label: 'Storefront', group: 'channels', source: { file: 'architecture.rcl', line: 10 } },
    { id: 'checkout', type: 'process', label: 'Checkout', group: 'services', source: { file: 'architecture.rcl', line: 20 } },
    { id: 'inventory', type: 'service', label: 'Inventory', group: 'services', status: 'warning', metadata: { lifecycle: 'legacy' } },
    { id: 'payment', type: 'external', label: 'Payment provider', group: 'external', status: 'critical' },
  ],
  edges: [
    { id: 'start', from: 'storefront', to: 'checkout', type: 'request' },
    { id: 'reserve', from: 'checkout', to: 'inventory', type: 'data' },
    { id: 'authorize', from: 'checkout', to: 'payment', type: 'request', metadata: { trustBoundary: true } },
  ],
  annotations: [
    { id: 'capacity', target: { kind: 'node', id: 'inventory' }, type: 'risk', severity: 'warning', body: 'Capacity may constrain checkout.' },
    { id: 'payment-boundary', target: { kind: 'edge', id: 'authorize' }, type: 'constraint', severity: 'critical', body: 'Authorization crosses a regulated boundary.' },
    { id: 'owner', target: { kind: 'group', id: 'services' }, type: 'decision', body: 'Platform owns the service boundary.', metadata: { topic: 'ownership' } },
    { id: 'source-evidence', target: { kind: 'node', id: 'checkout' }, type: 'evidence', body: 'Declared in architecture source.' },
  ],
}

describe('semantic lens projection', () => {
  const graph = normalizeGraph(architecture)

  it('derives stable matches, context, background, and explainable reasons', () => {
    const lens = getSemanticLensRecipe('risk')
    const first = deriveLensProjection(graph, lens)
    const second = deriveLensProjection(graph, lens)

    expect(second).toEqual(first)
    expect(first.matches.map(({ entity }) => `${entity.kind}:${entity.id}`)).toEqual([
      'node:storefront', 'node:checkout', 'node:inventory', 'node:payment',
      'edge:start', 'edge:reserve', 'edge:authorize',
      'group:channels', 'group:services', 'group:external',
    ])
    expect(getLensMatch(first, { kind: 'node', id: 'inventory' })).toMatchObject({
      role: 'match',
      reasons: [
        { code: 'rule-match', message: 'Entity status requires attention.' },
        { code: 'rule-match', message: 'A risk annotation targets this entity.', annotationId: 'capacity' },
      ],
    })
    expect(getLensMatch(first, { kind: 'node', id: 'checkout' })?.role).toBe('context')
    expect(getLensMatch(first, { kind: 'node', id: 'storefront' })?.role).toBe('background')
    expect(first.matchCount).toBe(3)
  })

  it('supports built-in recipes and declarative exact metadata rules', () => {
    expect(getLensMatch(deriveLensProjection(graph, getSemanticLensRecipe('trust')), { kind: 'edge', id: 'authorize' })?.role).toBe('match')
    expect(getLensMatch(deriveLensProjection(graph, getSemanticLensRecipe('data-flow')), { kind: 'edge', id: 'reserve' })?.role).toBe('match')
    expect(getLensMatch(deriveLensProjection(graph, getSemanticLensRecipe('provenance')), { kind: 'node', id: 'storefront' })?.role).toBe('match')
    expect(getLensMatch(deriveLensProjection(graph, getSemanticLensRecipe('ownership')), { kind: 'group', id: 'services' })?.role).toBe('match')
    expect(getLensMatch(deriveLensProjection(graph, getSemanticLensRecipe('modernization')), { kind: 'node', id: 'inventory' })?.role).toBe('match')

    const custom: SemanticLens = {
      id: 'platform-owner',
      label: 'Platform owner',
      rules: [{ entity: 'group', metadata: { key: 'owner', value: 'Platform' }, reason: 'Platform is accountable.' }],
      context: { relationshipHops: 0, includeGroups: true },
    }
    const projection = deriveLensProjection(graph, custom)
    expect(projection.matchCount).toBe(1)
    expect(getLensMatch(projection, { kind: 'group', id: 'services' })?.reasons[0]?.message).toBe('Platform is accountable.')
  })

  it('derives useful recipes across dependency and grouped architecture shapes', () => {
    const dependency = normalizeGraph(fixtures[2]!)
    const grouped = normalizeGraph(fixtures[3]!)
    expect(getLensMatch(deriveLensProjection(dependency, getSemanticLensRecipe('risk')), { kind: 'node', id: 'payment' })?.role).toBe('match')
    expect(getLensMatch(deriveLensProjection(dependency, getSemanticLensRecipe('data-flow')), { kind: 'edge', id: dependency.edges[1]!.id })?.role).toBe('match')
    expect(getLensMatch(deriveLensProjection(grouped, getSemanticLensRecipe('trust')), { kind: 'node', id: 'provider' })?.role).toBe('match')
  })

  it('adds lens evidence to inspection without changing ordinary inspection', () => {
    const projection = deriveLensProjection(graph, getSemanticLensRecipe('risk'))
    expect(inspectEntity(graph, { kind: 'node', id: 'inventory' })?.lens).toBeUndefined()
    expect(inspectEntity(graph, { kind: 'node', id: 'inventory' }, projection)?.lens).toMatchObject({
      id: 'risk', label: 'Risk', role: 'match',
    })
    expect(inspectEntity(graph, { kind: 'node', id: 'inventory' }, projection)?.lens?.reasons.length).toBeGreaterThan(0)
  })

  it('renders a lens as accessible treatment without changing scene geometry', async () => {
    const scene = await layoutGraph(architecture)
    const baseline = renderSvg(scene)
    const lensSvg = renderSvg(scene, { lens: getSemanticLensRecipe('risk') })

    expect(lensSvg).toContain('class="orbweaver ow-detail-standard ow-lens-active"')
    expect(lensSvg).toContain('data-lens-id="risk"')
    expect(lensSvg).toContain('data-node-id="inventory" data-node-type="service" data-node-status="warning" data-lens-role="match"')
    expect(lensSvg).toContain('data-node-id="storefront" data-node-type="service" data-node-status="default" data-lens-role="background"')
    expect(lensSvg).toContain('Active Risk lens match.')
    expect(lensSvg).toContain('class="ow-lens-summary">Risk lens active.')
    expect(lensSvg.match(/viewBox="[^"]+"/)?.[0]).toBe(baseline.match(/viewBox="[^"]+"/)?.[0])
    expect(scene.graph).toEqual(normalizeGraph(architecture))
  })
})
