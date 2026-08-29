import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { darkTheme, layoutGraph, lightTheme, renderSvg } from '../src/index.js'
import { resilienceFixtures } from './resilience-fixtures.js'

interface VisualSignature {
  readonly width: number
  readonly height: number
  readonly bytes: number
  readonly sha256: string
}

const approved: Record<string, VisualSignature> = {
  'deeply-nested/light': { width: 976, height: 376, bytes: 14_132, sha256: 'f843a41bbc405152f8b238370c90850c3e48e163e15cab51eb93bd9d21c1c4e8' },
  'deeply-nested/dark': { width: 976, height: 376, bytes: 14_128, sha256: '2534c9e5d56170a2759bcb21519809fd2ef0caee9ebd3c675bc2aca16a1c96fb' },
  'long-labels-unicode/light': { width: 1_600, height: 130, bytes: 13_077, sha256: '0413f36adb672f44b0263c16884e3ffc5fa43533f5cb6cd417ed12ecdecc3e21' },
  'long-labels-unicode/dark': { width: 1_600, height: 130, bytes: 13_073, sha256: '02df0dea952766caea8b8df24a97fde440e617912f4432a084e8d8600b1125e1' },
}

function signature(svg: string, width: number, height: number): VisualSignature {
  return {
    width,
    height,
    bytes: Buffer.byteLength(svg),
    sha256: createHash('sha256').update(svg).digest('hex'),
  }
}

describe('reviewed deterministic visual baselines', () => {
  for (const fixtureId of ['deeply-nested', 'long-labels-unicode']) {
    for (const [themeId, theme] of [['light', lightTheme], ['dark', darkTheme]] as const) {
      it(`${fixtureId} / ${themeId}`, async () => {
        const fixture = resilienceFixtures.find((candidate) => candidate.id === fixtureId)
        if (fixture === undefined) throw new Error(`Visual fixture "${fixtureId}" is missing.`)
        const scene = await layoutGraph(fixture.graph)
        const actual = signature(renderSvg(scene, { theme }), scene.width, scene.height)
        expect(actual).toEqual(approved[`${fixtureId}/${themeId}`])
      })
    }
  }
})
