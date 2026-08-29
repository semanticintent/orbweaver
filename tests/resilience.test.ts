import { describe, expect, it } from 'vitest'
import { darkTheme, layoutGraph, lightTheme, renderSvg, validateGraph } from '../src/index.js'
import { resilienceFixtures } from './resilience-fixtures.js'

function expectFinite(value: number): void {
  expect(Number.isFinite(value)).toBe(true)
  expect(value).toBeGreaterThanOrEqual(0)
}

describe('Phase 10E rendering resilience corpus', () => {
  it.each(resilienceFixtures.map((fixture) => [fixture.id, fixture] as const))(
    'validates and safely renders %s',
    async (_id, fixture) => {
      const validation = validateGraph(fixture.graph)
      expect(validation.valid).toBe(true)
      expect(validation.errors).toEqual([])
      for (const code of fixture.expectedWarningCodes ?? []) {
        expect(validation.warnings.some((warning) => warning.code === code)).toBe(true)
      }

      const scene = await layoutGraph(fixture.graph)
      expectFinite(scene.width)
      expectFinite(scene.height)
      expect(scene.nodes).toHaveLength(fixture.graph.nodes.length)
      expect(scene.edges).toHaveLength(fixture.graph.edges.length)
      expect(scene.groups).toHaveLength(fixture.graph.groups?.length ?? 0)

      for (const node of scene.nodes) {
        expectFinite(node.x)
        expectFinite(node.y)
        expect(node.width).toBeGreaterThan(0)
        expect(node.height).toBeGreaterThan(0)
      }
      for (const edge of scene.edges) {
        expect(edge.points.length).toBeGreaterThanOrEqual(2)
        expect(edge.points.flatMap((point) => [point.x, point.y]).every(Number.isFinite)).toBe(true)
      }

      for (const theme of [lightTheme, darkTheme]) {
        const svg = renderSvg(scene, { theme })
        expect(svg).toMatch(/^<svg /)
        expect(svg).toContain('role="img"')
        expect(svg).not.toMatch(/(?:NaN|Infinity)/)
      }
    },
  )

  it.each(resilienceFixtures.map((fixture) => [fixture.id, fixture] as const))(
    'keeps layout and light/dark output deterministic for %s',
    async (_id, fixture) => {
      const first = await layoutGraph(fixture.graph)
      const second = await layoutGraph(structuredClone(fixture.graph))
      expect(second).toEqual(first)
      expect(renderSvg(second, { theme: lightTheme })).toBe(renderSvg(first, { theme: lightTheme }))
      expect(renderSvg(second, { theme: darkTheme })).toBe(renderSvg(first, { theme: darkTheme }))
    },
  )
})

