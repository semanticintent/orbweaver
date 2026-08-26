import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import {
  defaultProposalValidationLimits,
  graphProposalJsonSchema,
  validateGraphProposal,
  type GraphProposal,
} from '../src/index.js'

async function fixture(name: string): Promise<unknown> {
  return JSON.parse(await readFile(new URL(`fixtures/proposals/${name}.json`, import.meta.url), 'utf8'))
}

describe('validateGraphProposal', () => {
  it('accepts a valid, attributed semantic proposal', async () => {
    const input = await fixture('valid')
    const result = validateGraphProposal(input)
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
    if (!result.valid) throw new Error('Expected a valid proposal.')
    expect(result.proposal.graph.id).toBe('ai-architecture')
    expect(result.proposal.claims?.[0]?.evidenceIds).toEqual(['api-contract'])
  })

  it('reports structural errors with stable JSON paths', async () => {
    const result = validateGraphProposal(await fixture('invalid'))
    expect(result.valid).toBe(false)
    expect(result.errors.map((entry) => entry.code)).toEqual(expect.arrayContaining([
      'proposal-schema-version-unsupported',
      'proposal-type-invalid',
      'proposal-claim-kind-invalid',
      'proposal-claim-evidence-missing',
    ]))
    expect(result.errors.some((entry) => entry.path === '$.graph.edges')).toBe(true)
  })

  it('rejects authored geometry, renderer fields, and executable markup', async () => {
    const result = validateGraphProposal(await fixture('adversarial'))
    expect(result.valid).toBe(false)
    expect(result.errors.map((entry) => entry.code)).toEqual(expect.arrayContaining([
      'proposal-field-forbidden',
      'proposal-field-unknown',
      'proposal-markup-forbidden',
    ]))
    expect(result.errors.map((entry) => entry.path)).toEqual(expect.arrayContaining([
      '$.graph.nodes[0].x',
      '$.graph.nodes[0].style',
      '$.graph.edges[0].points',
      '$.graph.svg',
    ]))
  })

  it('enforces configurable resource and content limits', () => {
    const proposal: GraphProposal = {
      schemaVersion: '1',
      graph: {
        id: 'limited',
        nodes: [
          { id: 'a', label: 'A label that is deliberately too long', metadata: { one: { two: { three: true } } } },
          { id: 'b', label: 'B' },
        ],
        edges: [{ from: 'a', to: 'b' }],
      },
      generation: { adapter: 'test' },
    }
    const result = validateGraphProposal(proposal, {
      limits: { maxNodes: 1, maxLabelLength: 8, maxMetadataDepth: 2 },
    })
    expect(result.errors.map((entry) => entry.code)).toEqual(expect.arrayContaining([
      'proposal-nodes-limit',
      'proposal-label-length-limit',
      'proposal-metadata-depth-limit',
    ]))
  })

  it('keeps ordinary graph diagnostics and warnings in the proposal result', () => {
    const result = validateGraphProposal({
      schemaVersion: '1',
      graph: {
        id: 'graph-diagnostics',
        nodes: [{ id: 'a', label: 'A' }, { id: 'isolated', label: 'Isolated' }],
        edges: [{ from: 'a', to: 'missing' }],
      },
      generation: { adapter: 'test' },
    })
    expect(result.errors.some((entry) => entry.code === 'edge-target-missing')).toBe(true)
    expect(result.warnings.some((entry) => entry.code === 'node-disconnected')).toBe(true)
  })

  it('rejects claims that target missing semantic entities', () => {
    const result = validateGraphProposal({
      schemaVersion: '1',
      graph: {
        id: 'missing-claim-target',
        nodes: [{ id: 'a', label: 'A' }],
        edges: [],
      },
      generation: { adapter: 'test' },
      claims: [{
        entity: { kind: 'node', id: 'absent' },
        evidenceIds: [],
      }],
    })
    expect(result.errors).toContainEqual(expect.objectContaining({
      code: 'proposal-claim-entity-missing',
      path: '$.claims[0].entity.id',
    }))
  })

  it('rejects non-serializable circular proposals without recursing forever', () => {
    const circular: Record<string, unknown> = { schemaVersion: '1' }
    circular.graph = circular
    const result = validateGraphProposal(circular)
    expect(result.valid).toBe(false)
    expect(result.errors.some((entry) => entry.code === 'proposal-not-serializable')).toBe(true)
  })

  it('exports the stable schema identity and documented defaults', () => {
    expect(graphProposalJsonSchema.$id).toContain('graph-proposal-1.json')
    expect(graphProposalJsonSchema.properties.schemaVersion.const).toBe('1')
    expect(defaultProposalValidationLimits).toMatchObject({
      maxBytes: 1024 * 1024,
      maxNodes: 250,
      maxEdges: 500,
      maxGroups: 50,
      maxLabelLength: 200,
      maxDescriptionLength: 2000,
      maxMetadataDepth: 8,
    })
  })
})
