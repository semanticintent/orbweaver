import { describe, expect, it } from 'vitest'
import { layoutGraph, renderSvg, validateGraph } from '../src/index.js'
import { showcases } from '../examples/showcases.mjs'

describe('public showcases', () => {
  function touchesBoundary(point, node, tolerance = 0.01) {
    const withinX = point.x >= node.x - tolerance && point.x <= node.x + node.width + tolerance
    const withinY = point.y >= node.y - tolerance && point.y <= node.y + node.height + tolerance
    const onX = Math.abs(point.x - node.x) <= tolerance || Math.abs(point.x - (node.x + node.width)) <= tolerance
    const onY = Math.abs(point.y - node.y) <= tolerance || Math.abs(point.y - (node.y + node.height)) <= tolerance
    return withinX && withinY && (onX || onY)
  }

  function overlaps(label, node) {
    return label.x < node.x + node.width && label.x + label.width > node.x
      && label.y < node.y + node.height && label.y + label.height > node.y
  }

  it('contains the four promised diagram categories', () => {
    expect(showcases.map((showcase) => showcase.kicker)).toEqual([
      'Process flow',
      'Decision flow',
      'Dependency map',
      'System architecture',
    ])
  })

  it.each(showcases.map((showcase) => [showcase.slug, showcase]))(
    '%s validates, lays out, renders, and preserves source identity',
    async (_slug, showcase) => {
      expect(validateGraph(showcase.graph).valid).toBe(true)
      expect(showcase.graph.nodes.every((node) => node.source?.file && node.source.line)).toBe(true)
      const scene = await layoutGraph(showcase.graph, showcase.layout)
      const svg = renderSvg(scene)
      expect(scene.nodes).toHaveLength(showcase.graph.nodes.length)
      expect(svg).toContain('<svg')
      expect(svg).not.toMatch(/NaN|Infinity/)
      for (const sceneEdge of scene.edges) {
        const edge = scene.graph.edges.find((candidate) => candidate.id === sceneEdge.edgeId)
        const source = scene.nodes.find((node) => node.nodeId === edge?.from)
        const target = scene.nodes.find((node) => node.nodeId === edge?.to)
        expect(source).toBeDefined()
        expect(target).toBeDefined()
        expect(touchesBoundary(sceneEdge.points[0], source)).toBe(true)
        expect(touchesBoundary(sceneEdge.points.at(-1), target)).toBe(true)
        if (sceneEdge.label !== undefined) {
          expect(scene.nodes.some((node) => overlaps(sceneEdge.label, node))).toBe(false)
        }
      }
    },
  )
})
