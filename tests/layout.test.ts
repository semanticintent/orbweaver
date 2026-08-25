import { describe, expect, it } from 'vitest'
import { layoutGraph, type Graph, type Scene } from '../src/index.js'
import { fixtures } from './fixtures.js'

function node(scene: Scene, id: string) {
  const value = scene.nodes.find((candidate) => candidate.nodeId === id)
  if (value === undefined) throw new Error(`Scene node "${id}" was not found.`)
  return value
}

function expectFiniteScene(scene: Scene, graph: Graph): void {
  expect(Number.isFinite(scene.width)).toBe(true)
  expect(Number.isFinite(scene.height)).toBe(true)
  expect(scene.width).toBeGreaterThan(0)
  expect(scene.height).toBeGreaterThan(0)
  expect(scene.nodes).toHaveLength(graph.nodes.length)
  expect(scene.edges).toHaveLength(graph.edges.length)
  expect(scene.groups).toHaveLength(graph.groups?.length ?? 0)

  for (const shape of [...scene.nodes, ...scene.groups]) {
    expect([shape.x, shape.y, shape.width, shape.height].every(Number.isFinite)).toBe(true)
    expect(shape.width).toBeGreaterThan(0)
    expect(shape.height).toBeGreaterThan(0)
    expect(shape.x).toBeGreaterThanOrEqual(0)
    expect(shape.y).toBeGreaterThanOrEqual(0)
    expect(shape.x + shape.width).toBeLessThanOrEqual(scene.width)
    expect(shape.y + shape.height).toBeLessThanOrEqual(scene.height)
  }

  for (const edge of scene.edges) {
    expect(edge.points.length).toBeGreaterThanOrEqual(2)
    expect(edge.points.every((point) => Number.isFinite(point.x) && Number.isFinite(point.y))).toBe(true)
  }
}

describe('ELK hierarchical layout', () => {
  it.each(fixtures.map((fixture) => [fixture.id, fixture] as const))(
    'lays out %s into finite Orbweaver scene geometry',
    async (_id, fixture) => {
      const scene = await layoutGraph(fixture)
      expectFiniteScene(scene, fixture)
    },
  )

  it('is deterministic for identical input and options', async () => {
    const fixture = fixtures[1]
    if (fixture === undefined) throw new Error('Decision fixture is missing.')
    const first = await layoutGraph(fixture, { direction: 'LR' })
    const second = await layoutGraph(fixture, { direction: 'LR' })
    expect(second).toEqual(first)
  })

  it('honors left-to-right and top-to-bottom direction', async () => {
    const fixture = fixtures[0]
    if (fixture === undefined) throw new Error('Basic flow fixture is missing.')
    const horizontal = await layoutGraph(fixture, { direction: 'LR' })
    const vertical = await layoutGraph(fixture, { direction: 'TB' })

    expect(node(horizontal, 'author').x).toBeLessThan(node(horizontal, 'compiler').x)
    expect(node(horizontal, 'compiler').x).toBeLessThan(node(horizontal, 'artifact').x)
    expect(node(vertical, 'author').y).toBeLessThan(node(vertical, 'compiler').y)
    expect(node(vertical, 'compiler').y).toBeLessThan(node(vertical, 'artifact').y)
  })

  it('does not mutate graph input', async () => {
    const fixture = fixtures[2]
    if (fixture === undefined) throw new Error('Dependency fixture is missing.')
    const before = structuredClone(fixture)
    await layoutGraph(fixture)
    expect(fixture).toEqual(before)
  })

  it('places grouped nodes inside their scene groups', async () => {
    const fixture = fixtures[3]
    if (fixture === undefined) throw new Error('Architecture fixture is missing.')
    const scene = await layoutGraph(fixture)

    for (const semanticNode of fixture.nodes) {
      if (semanticNode.group === undefined) continue
      const sceneNode = node(scene, semanticNode.id)
      const group = scene.groups.find((candidate) => candidate.groupId === semanticNode.group)
      expect(group).toBeDefined()
      if (group === undefined) continue
      expect(sceneNode.x).toBeGreaterThanOrEqual(group.x)
      expect(sceneNode.y).toBeGreaterThanOrEqual(group.y)
      expect(sceneNode.x + sceneNode.width).toBeLessThanOrEqual(group.x + group.width)
      expect(sceneNode.y + sceneNode.height).toBeLessThanOrEqual(group.y + group.height)
    }
  })
})
