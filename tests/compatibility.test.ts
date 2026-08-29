import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  contractJsonSchemas,
  contractSchemaIds,
  contractVersions,
  createGraphDocument,
  createSceneDocument,
  graphFromDocument,
  inspectContractVersion,
  readGraphDocument,
  readSceneDocument,
  sceneFromDocument,
  type Graph,
} from '../src/index.js'

function fixture(name: string): unknown {
  return JSON.parse(readFileSync(new URL(`fixtures/compatibility/${name}`, import.meta.url), 'utf8'))
}

describe('contract versions and schemas', () => {
  it('publishes one explicit version registry and stable schema identities', () => {
    expect(contractVersions).toEqual({
      graph: '1',
      scene: '1',
      graphProposal: '1',
      portableHtml: '1',
      svg: '1',
      png: '1',
    })
    expect(contractJsonSchemas.graph.$id).toBe(contractSchemaIds.graph)
    expect(contractJsonSchemas.graphDocument.properties?.version?.const).toBe('1')
    expect(contractJsonSchemas.sceneDocument.properties?.version?.const).toBe('1')
    expect(contractJsonSchemas.graphProposal.properties?.schemaVersion?.const).toBe('1')
    expect(contractJsonSchemas.portableHtml.properties?.format?.const).toBe('orbweaver-portable-html')
    expect(contractJsonSchemas.svg.properties?.format?.const).toBe('orbweaver-svg')
    expect(contractJsonSchemas.png.properties?.format?.const).toBe('orbweaver-png')
  })

  it('distinguishes missing, invalid, older, and future versions actionably', () => {
    expect(inspectContractVersion('svg', undefined).diagnostics[0]).toMatchObject({ code: 'contract-version-required', path: '$.version' })
    expect(inspectContractVersion('svg', 1).diagnostics[0]).toMatchObject({ code: 'contract-version-invalid' })
    expect(inspectContractVersion('svg', '0').diagnostics[0]).toMatchObject({ code: 'contract-version-unsupported' })
    const future = inspectContractVersion('svg', '2')
    expect(future.compatible).toBe(false)
    expect(future.diagnostics[0]).toMatchObject({ code: 'contract-version-newer', action: 'Upgrade Orbweaver before opening this document.' })
  })
})

describe('graph document compatibility', () => {
  it('losslessly migrates an unversioned v0.1 graph into a v1 document', () => {
    const result = readGraphDocument(fixture('legacy-graph-v0.1.json'))
    expect(result.compatible).toBe(true)
    if (!result.compatible) return
    expect(result.diagnostics).toEqual([expect.objectContaining({ code: 'contract-version-assumed', severity: 'warning' })])
    expect(result.document).toMatchObject({ format: 'orbweaver-graph', version: '1' })
    expect(result.document.graph.edges[0]).toMatchObject({ id: 'edge:source->publish:flow:0', direction: 'forward' })
    expect(result.document.graph.options.directed).toBe(true)
  })

  it('opens the frozen v1 graph fixture without migration', () => {
    const result = readGraphDocument(fixture('graph-document-v1.json'))
    expect(result.compatible).toBe(true)
    if (!result.compatible) return
    expect(result.diagnostics).toEqual([])
    expect(result.document.graph.edges[0]?.id).toBe('submit')
  })

  it('creates detached versioned documents and detached graph values', () => {
    const graph: Graph = { id: 'detached', nodes: [{ id: 'a', label: 'A' }], edges: [] }
    const document = createGraphDocument(graph)
    const extracted = graphFromDocument(document)
    extracted.nodes[0]!.label = 'Changed'
    expect(graph.nodes[0]?.label).toBe('A')
    expect(document.graph.nodes[0]?.label).toBe('A')
  })

  it('rejects future envelopes and malformed legacy data without throwing', () => {
    const future = readGraphDocument({ format: 'orbweaver-graph', version: '2', graph: {} })
    expect(future).toMatchObject({ compatible: false, diagnostics: [{ code: 'contract-version-newer' }] })
    const malformed = readGraphDocument({ id: 'broken', nodes: [{ id: 'a' }], edges: [] })
    expect(malformed).toMatchObject({ compatible: false, diagnostics: [{ code: 'graph-shape-invalid', path: '$' }] })
  })
})

describe('scene and artifact compatibility fixtures', () => {
  it('opens and detaches the frozen v1 scene fixture', () => {
    const result = readSceneDocument(fixture('scene-document-v1.json'))
    expect(result.compatible).toBe(true)
    if (!result.compatible) return
    const scene = sceneFromDocument(result.document)
    scene.nodes[0]!.x = 999
    expect(result.document.scene.nodes[0]?.x).toBe(24)
    expect(result.document.scene.graph.edges[0]?.direction).toBe('forward')
  })

  it('rejects incomplete scene geometry actionably', () => {
    const result = readSceneDocument({ width: 100, height: 100, nodes: [{}], edges: [], groups: [], graph: fixture('legacy-graph-v0.1.json') })
    expect(result).toMatchObject({ compatible: false, diagnostics: [{ code: 'scene-shape-invalid', path: '$' }] })
    expect(() => createSceneDocument({ width: Number.NaN, height: 100, nodes: [], edges: [], groups: [], graph: createGraphDocument({ id: 'invalid-scene', nodes: [], edges: [] }).graph }))
      .toThrow(/Regenerate the scene/)
  })

  it.each([
    ['portableHtml', 'portable-html-manifest-v1.json'],
    ['svg', 'svg-manifest-v1.json'],
    ['png', 'png-manifest-v1.json'],
  ] as const)('keeps the frozen %s manifest readable', (kind, name) => {
    const value = fixture(name) as { version?: unknown }
    expect(inspectContractVersion(kind, value.version)).toMatchObject({ compatible: true, detectedVersion: '1', diagnostics: [] })
    expect(JSON.parse(JSON.stringify(value))).toEqual(value)
  })
})
