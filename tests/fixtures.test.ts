import { describe, expect, it } from 'vitest'
import { normalizeGraph, validateGraph } from '../src/index.js'
import { fixtures } from './fixtures.js'

describe('v0.1 graph fixtures', () => {
  it.each(fixtures.map((fixture) => [fixture.id, fixture] as const))(
    '%s is valid, JSON-compatible, and coordinate-free',
    (_id, fixture) => {
      expect(validateGraph(fixture).valid).toBe(true)
      expect(JSON.parse(JSON.stringify(fixture))).toEqual(fixture)
      expect(JSON.stringify(fixture)).not.toMatch(/"(?:x|y|width|height)":/)
      expect(normalizeGraph(fixture).edges.every((edge) => edge.id.length > 0)).toBe(true)
    },
  )
})
