import { describe, expect, it } from 'vitest'
import {
  getGroupNodes,
  getAnnotations,
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
  annotations: [
    { id: 'api-policy', target: { kind: 'node', id: 'api' }, type: 'constraint', body: 'Requests require authorization.' },
    { id: 'data-risk', target: { kind: 'edge', id: 'api-db' }, type: 'risk', severity: 'warning', body: 'Sensitive data crosses a boundary.' },
    { id: 'platform-decision', target: { kind: 'group', id: 'platform' }, type: 'decision', body: 'Platform ownership is centralized.' },
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

  it('returns semantic annotations for an exact target in graph order', () => {
    expect(getAnnotations(graph, { kind: 'node', id: 'api' }).map((annotation) => annotation.id)).toEqual(['api-policy'])
    expect(getAnnotations(graph, { kind: 'edge', id: 'api-db' }).map((annotation) => annotation.id)).toEqual(['data-risk'])
    expect(getAnnotations(graph)).toEqual([])
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
      annotations: [
        { id: 'api-policy', target: { kind: 'node', id: 'api' }, type: 'constraint', body: 'Requests require authorization.' },
      ],
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
      annotations: [{ id: 'data-risk', severity: 'warning' }],
    })
    expect(inspectEntity(normalized, { kind: 'group', id: 'platform' })?.memberNodeIds).toEqual(['web', 'api'])
    expect(inspectEntity(normalized, { kind: 'group', id: 'platform' })?.annotations?.[0]?.type).toBe('decision')
  })

  it('returns undefined for an unknown entity', () => {
    expect(inspectEntity(normalized, { kind: 'node', id: 'missing' })).toBeUndefined()
  })
})
