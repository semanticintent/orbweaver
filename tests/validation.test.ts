import { describe, expect, it } from 'vitest'
import { GraphValidationError, normalizeGraph, validateGraph, type Graph } from '../src/index.js'

function graph(overrides: Partial<Graph> = {}): Graph {
  return {
    id: 'example',
    nodes: [
      { id: 'a', label: 'A' },
      { id: 'b', label: 'B' },
    ],
    edges: [{ from: 'a', to: 'b' }],
    ...overrides,
  }
}

describe('validateGraph', () => {
  it('accepts unknown semantic types', () => {
    const result = validateGraph(graph({
      nodes: [
        { id: 'a', type: 'domain-specific-concept', label: 'A' },
        { id: 'b', type: 'something-new', label: 'B' },
      ],
    }))
    expect(result.valid).toBe(true)
  })

  it('reports duplicate nodes and dangling edges', () => {
    const result = validateGraph(graph({
      nodes: [
        { id: 'a', label: 'A' },
        { id: 'a', label: 'Again' },
      ],
      edges: [{ id: 'missing', from: 'a', to: 'nowhere' }],
    }))
    expect(result.valid).toBe(false)
    expect(result.errors.map((entry) => entry.code)).toEqual(
      expect.arrayContaining(['node-id-duplicate', 'edge-target-missing']),
    )
  })

  it('reports missing groups and group parent cycles', () => {
    const result = validateGraph(graph({
      nodes: [
        { id: 'a', label: 'A', group: 'absent' },
        { id: 'b', label: 'B' },
      ],
      groups: [
        { id: 'one', label: 'One', parent: 'two' },
        { id: 'two', label: 'Two', parent: 'one' },
      ],
    }))
    expect(result.errors.map((entry) => entry.code)).toEqual(
      expect.arrayContaining(['node-group-missing', 'group-parent-cycle']),
    )
  })

  it('returns warnings without making a graph invalid', () => {
    const result = validateGraph(graph({
      nodes: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
        { id: 'isolated', label: '' },
      ],
    }))
    expect(result.valid).toBe(true)
    expect(result.warnings.map((entry) => entry.code)).toEqual(
      expect.arrayContaining(['node-disconnected', 'node-label-empty']),
    )
  })

  it('throws an explicit error when normalization receives an invalid graph', () => {
    expect(() => normalizeGraph(graph({ edges: [{ from: 'a', to: 'missing' }] })))
      .toThrow(GraphValidationError)
  })
})
