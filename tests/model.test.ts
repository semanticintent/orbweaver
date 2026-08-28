import { describe, expect, it } from 'vitest'
import { createGraph, normalizeGraph, type Graph } from '../src/index.js'

const fixture: Graph = {
  id: 'checkout',
  nodes: [
    { id: 'cart', type: 'process', label: 'Cart' },
    {
      id: 'payment',
      type: 'decision',
      label: 'Payment accepted?',
      source: { file: 'checkout.rcl', line: 42, path: 'PAYMENT' },
    },
  ],
  edges: [{ from: 'cart', to: 'payment', type: 'flow' }],
}

describe('createGraph', () => {
  it('does not retain caller-owned arrays or nested provenance', () => {
    const graph = createGraph(fixture)
    expect(graph).toEqual(fixture)
    expect(graph).not.toBe(fixture)
    expect(graph.nodes).not.toBe(fixture.nodes)
    expect(graph.nodes[1]?.source).not.toBe(fixture.nodes[1]?.source)
  })
})

describe('normalizeGraph', () => {
  it('assigns deterministic edge identity and graph direction defaults', () => {
    const graph = normalizeGraph(fixture)
    expect(graph.options.directed).toBe(true)
    expect(graph.edges[0]).toMatchObject({
      id: 'edge:cart->payment:flow:0',
      direction: 'forward',
    })
  })

  it('preserves provenance without mutating input', () => {
    const graph = normalizeGraph(fixture)
    expect(graph.nodes[1]?.source).toEqual({ file: 'checkout.rcl', line: 42, path: 'PAYMENT' })
    expect(fixture.edges[0]?.id).toBeUndefined()
  })

  it('uses undirected defaults when requested', () => {
    const graph = normalizeGraph({ ...fixture, options: { directed: false } })
    expect(graph.edges[0]?.direction).toBe('none')
  })

  it('preserves semantic annotations without retaining caller-owned values', () => {
    const input: Graph = {
      ...fixture,
      annotations: [{
        id: 'approval',
        target: { kind: 'node', id: 'payment' },
        type: 'decision',
        severity: 'warning',
        body: 'A person approves the final revision.',
      }],
    }
    const graph = normalizeGraph(input)
    expect(graph.annotations).toEqual(input.annotations)
    expect(graph.annotations).not.toBe(input.annotations)
    expect(graph.annotations?.[0]?.target).not.toBe(input.annotations?.[0]?.target)
  })

  it('avoids collisions between explicit and generated edge IDs', () => {
    const graph = normalizeGraph({
      ...fixture,
      edges: [
        { from: 'cart', to: 'payment', type: 'flow' },
        { id: 'edge:cart->payment:flow:0', from: 'payment', to: 'cart' },
      ],
    })
    expect(graph.edges.map((edge) => edge.id)).toEqual([
      'edge:cart->payment:flow:0:1',
      'edge:cart->payment:flow:0',
    ])
  })
})
