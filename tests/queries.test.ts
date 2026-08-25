import { describe, expect, it } from 'vitest'
import {
  getGroupNodes,
  getIncidentEdges,
  getIncomingEdges,
  getNeighbors,
  getOutgoingEdges,
  inspectEntity,
  normalizeGraph,
  type Graph,
} from '../src/index.js'

const graph: Graph = {
  id: 'queries',
  groups: [
    { id: 'platform', label: 'Platform' },
    { id: 'services', label: 'Services', parent: 'platform' },
  ],
  nodes: [
    { id: 'web', label: 'Web', group: 'platform' },
    {
      id: 'api',
      type: 'service',
      label: 'API',
      group: 'services',
      metadata: { owner: 'Platform' },
      source: { file: 'architecture.rcl', line: 42, path: 'API-SERVICE' },
    },
    { id: 'db', label: 'Database' },
  ],
  edges: [
    { id: 'web-api', from: 'web', to: 'api', type: 'request' },
    { id: 'api-db', from: 'api', to: 'db', type: 'data' },
  ],
}

describe('graph queries', () => {
  it('returns directional and incident relationships', () => {
    expect(getIncomingEdges(graph, 'api').map((edge) => edge.id)).toEqual(['web-api'])
    expect(getOutgoingEdges(graph, 'api').map((edge) => edge.id)).toEqual(['api-db'])
    expect(getIncidentEdges(graph, 'api').map((edge) => edge.id)).toEqual(['web-api', 'api-db'])
  })

  it('returns unique neighboring nodes in graph order', () => {
    expect(getNeighbors(graph, 'api').map((node) => node.id)).toEqual(['web', 'db'])
  })

  it('supports recursive and direct group membership', () => {
    expect(getGroupNodes(graph, 'platform').map((node) => node.id)).toEqual(['web', 'api'])
    expect(getGroupNodes(graph, 'platform', false).map((node) => node.id)).toEqual(['web'])
  })
})

describe('inspection', () => {
  const normalized = normalizeGraph(graph)

  it('returns relationships, metadata, and provenance for a node', () => {
    expect(inspectEntity(normalized, { kind: 'node', id: 'api' })).toEqual({
      kind: 'node',
      id: 'api',
      label: 'API',
      type: 'service',
      metadata: { owner: 'Platform' },
      source: { file: 'architecture.rcl', line: 42, path: 'API-SERVICE' },
      relationships: {
        incomingEdgeIds: ['web-api'],
        outgoingEdgeIds: ['api-db'],
        neighborNodeIds: ['web', 'db'],
      },
    })
  })

  it('returns endpoints for edges and recursive membership for groups', () => {
    expect(inspectEntity(normalized, { kind: 'edge', id: 'api-db' })).toMatchObject({
      kind: 'edge',
      id: 'api-db',
      from: 'api',
      to: 'db',
    })
    expect(inspectEntity(normalized, { kind: 'group', id: 'platform' })?.memberNodeIds).toEqual(['web', 'api'])
  })

  it('returns undefined for an unknown entity', () => {
    expect(inspectEntity(normalized, { kind: 'node', id: 'missing' })).toBeUndefined()
  })
})
