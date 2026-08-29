import type { Graph } from '../src/index.js'

function chainNodes(count: number, prefix: string, group?: string): Graph['nodes'] {
  return Array.from({ length: count }, (_, index) => ({
    id: `${prefix}-${index + 1}`,
    type: index % 5 === 4 ? 'database' : index % 3 === 2 ? 'decision' : 'process',
    label: `${prefix} ${index + 1}`,
    ...(group === undefined ? {} : { group }),
  }))
}

function chainEdges(count: number, prefix: string): Graph['edges'] {
  return Array.from({ length: Math.max(0, count - 1) }, (_, index) => ({
    id: `${prefix}-edge-${index + 1}`,
    from: `${prefix}-${index + 1}`,
    to: `${prefix}-${index + 2}`,
    type: index % 3 === 2 ? 'dependency' : 'flow',
    ...(index % 4 === 0 ? { label: `Step ${index + 1}` } : {}),
  }))
}

function denseGraph(): Graph {
  const count = 32
  const nodes = chainNodes(count, 'service')
  const edges = chainEdges(count, 'service')
  for (let index = 0; index < count - 4; index += 1) {
    edges.push({
      id: `cross-edge-${index + 1}`,
      from: `service-${index + 1}`,
      to: `service-${index + 5}`,
      type: 'event',
    })
  }
  return { id: 'dense-graph', title: 'Dense service topology', nodes, edges }
}

export interface ResilienceFixture {
  readonly id: string
  readonly graph: Graph
  readonly expectedWarningCodes?: readonly string[]
}

export const resilienceFixtures: readonly ResilienceFixture[] = [
  {
    id: 'empty',
    graph: { id: 'empty', title: 'Empty semantic workspace', nodes: [], edges: [] },
  },
  {
    id: 'disconnected',
    graph: {
      id: 'disconnected',
      title: 'Disconnected capabilities',
      nodes: [
        { id: 'catalog', type: 'service', label: 'Catalog' },
        { id: 'pricing', type: 'service', label: 'Pricing' },
        { id: 'archive', type: 'database', label: 'Archive' },
      ],
      edges: [{ id: 'prices', from: 'catalog', to: 'pricing', type: 'request' }],
    },
    expectedWarningCodes: ['node-disconnected'],
  },
  {
    id: 'cyclic',
    graph: {
      id: 'cyclic',
      title: 'Cyclic recovery workflow',
      nodes: chainNodes(5, 'recovery'),
      edges: [
        ...chainEdges(5, 'recovery'),
        { id: 'retry-cycle', from: 'recovery-5', to: 'recovery-2', type: 'retry', label: 'Retry safely' },
      ],
    },
  },
  {
    id: 'deeply-nested',
    graph: {
      id: 'deeply-nested',
      title: 'Nested operating model',
      groups: [
        { id: 'enterprise', label: 'Enterprise' },
        { id: 'platform', label: 'Platform', parent: 'enterprise' },
        { id: 'commerce', label: 'Commerce', parent: 'platform' },
        { id: 'checkout', label: 'Checkout', parent: 'commerce' },
      ],
      nodes: [
        { id: 'entry', type: 'service', label: 'Storefront', group: 'enterprise' },
        { id: 'gateway', type: 'service', label: 'API gateway', group: 'platform' },
        { id: 'order', type: 'process', label: 'Order orchestration', group: 'commerce' },
        { id: 'payment', type: 'service', label: 'Payment authorization', group: 'checkout' },
      ],
      edges: [
        { id: 'enter', from: 'entry', to: 'gateway', type: 'request' },
        { id: 'orchestrate', from: 'gateway', to: 'order', type: 'flow' },
        { id: 'authorize', from: 'order', to: 'payment', type: 'dependency' },
      ],
    },
  },
  { id: 'dense', graph: denseGraph() },
  {
    id: 'long-labels-unicode',
    graph: {
      id: 'unicode',
      title: 'Global fulfillment — 東京 → Montréal → München',
      description: 'Preserves accents, emoji 🚀, bidirectional punctuation, and long semantic labels.',
      nodes: [
        { id: 'request', type: 'document', label: 'Customer fulfillment request with exceptionally detailed regulatory context — 東京' },
        { id: 'review', type: 'process', label: 'Réviser les contraintes de souveraineté et de livraison — Montréal' },
        { id: 'result', type: 'document', label: 'Bestätigte Lieferentscheidung mit nachvollziehbarer Begründung — München' },
      ],
      edges: [
        { id: 'review-edge', from: 'request', to: 'review', type: 'flow', label: '分類・review・prüfen' },
        { id: 'result-edge', from: 'review', to: 'result', type: 'evidence', label: 'Approved with provenance and policy evidence' },
      ],
    },
  },
  {
    id: 'sparse-metadata',
    graph: {
      id: 'sparse-metadata',
      nodes: [{ id: 'unknown', label: 'Unknown capability', metadata: { owner: null, tags: [], score: 0 } }],
      edges: [],
    },
    expectedWarningCodes: ['node-disconnected'],
  },
]
