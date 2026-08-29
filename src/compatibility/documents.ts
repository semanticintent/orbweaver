import { ContractCompatibilityError, GraphValidationError } from '../errors.js'
import type { Graph, NormalizedGraph } from '../model/types.js'
import { normalizeGraph } from '../model/normalize.js'
import type { Scene } from '../scene/types.js'
import { inspectContractVersion } from './inspect.js'
import type { CompatibilityDiagnostic, ContractReadResult, GraphDocument, SceneDocument } from './types.js'
import { contractVersions } from './versions.js'

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function diagnostic(code: string, message: string, action: string, path?: string): CompatibilityDiagnostic {
  return { code, severity: 'error', message, action, ...(path === undefined ? {} : { path }) }
}

function exact(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const allowed = new Set(keys)
  return Object.keys(value).every((key) => allowed.has(key))
}

function optionalString(value: unknown): boolean {
  return value === undefined || typeof value === 'string'
}

function optionalFiniteNumber(value: unknown): boolean {
  return value === undefined || finite(value)
}

function metadata(value: unknown): boolean {
  return value === undefined || record(value)
}

function provenance(value: unknown): boolean {
  return value === undefined || record(value)
    && exact(value, ['uri', 'file', 'line', 'column', 'endLine', 'endColumn', 'path', 'recordId', 'artifactId', 'metadata'])
    && optionalString(value.uri)
    && optionalString(value.file)
    && optionalFiniteNumber(value.line)
    && optionalFiniteNumber(value.column)
    && optionalFiniteNumber(value.endLine)
    && optionalFiniteNumber(value.endColumn)
    && optionalString(value.path)
    && optionalString(value.recordId)
    && optionalString(value.artifactId)
    && metadata(value.metadata)
}

function nodeShape(value: unknown): boolean {
  return record(value)
    && exact(value, ['id', 'type', 'label', 'description', 'group', 'layer', 'status', 'value', 'metadata', 'source'])
    && typeof value.id === 'string'
    && typeof value.label === 'string'
    && optionalString(value.type)
    && optionalString(value.description)
    && optionalString(value.group)
    && optionalString(value.layer)
    && optionalString(value.status)
    && (value.value === undefined || typeof value.value === 'string' || finite(value.value))
    && metadata(value.metadata)
    && provenance(value.source)
}

function edgeShape(value: unknown): boolean {
  return record(value)
    && exact(value, ['id', 'from', 'to', 'type', 'label', 'direction', 'metadata', 'source'])
    && optionalString(value.id)
    && typeof value.from === 'string'
    && typeof value.to === 'string'
    && optionalString(value.type)
    && optionalString(value.label)
    && (value.direction === undefined || ['forward', 'backward', 'both', 'none'].includes(String(value.direction)))
    && metadata(value.metadata)
    && provenance(value.source)
}

function groupShape(value: unknown): boolean {
  return record(value)
    && exact(value, ['id', 'label', 'description', 'parent', 'type', 'metadata', 'source'])
    && typeof value.id === 'string'
    && typeof value.label === 'string'
    && optionalString(value.description)
    && optionalString(value.parent)
    && optionalString(value.type)
    && metadata(value.metadata)
    && provenance(value.source)
}

function annotationShape(value: unknown): boolean {
  const target = value !== null && record(value) ? value.target : undefined
  return record(value)
    && exact(value, ['id', 'target', 'label', 'body', 'type', 'severity', 'metadata', 'source'])
    && typeof value.id === 'string'
    && typeof value.body === 'string'
    && (target === undefined || record(target)
      && exact(target, ['kind', 'id'])
      && ['graph', 'node', 'edge', 'group'].includes(String(target.kind))
      && optionalString(target.id))
    && optionalString(value.label)
    && optionalString(value.type)
    && (value.severity === undefined || ['info', 'warning', 'critical'].includes(String(value.severity)))
    && metadata(value.metadata)
    && provenance(value.source)
}

function graphOptions(value: unknown): boolean {
  if (value === undefined) return true
  if (!record(value) || !exact(value, ['directed', 'layout'])) return false
  if (value.directed !== undefined && typeof value.directed !== 'boolean') return false
  if (value.layout === undefined) return true
  return record(value.layout)
    && exact(value.layout, ['engine', 'direction'])
    && optionalString(value.layout.engine)
    && (value.layout.direction === undefined || ['LR', 'RL', 'TB', 'BT'].includes(String(value.layout.direction)))
}

function graphShape(value: unknown): value is Graph {
  return record(value)
    && exact(value, ['id', 'title', 'description', 'nodes', 'edges', 'groups', 'annotations', 'metadata', 'options'])
    && typeof value.id === 'string'
    && optionalString(value.title)
    && optionalString(value.description)
    && Array.isArray(value.nodes) && value.nodes.every(nodeShape)
    && Array.isArray(value.edges) && value.edges.every(edgeShape)
    && (value.groups === undefined || Array.isArray(value.groups) && value.groups.every(groupShape))
    && (value.annotations === undefined || Array.isArray(value.annotations) && value.annotations.every(annotationShape))
    && metadata(value.metadata)
    && graphOptions(value.options)
}

function normalizeUnknownGraph(value: unknown, path: string): ContractReadResult<GraphDocument> {
  if (!graphShape(value)) {
    return {
      compatible: false,
      diagnostics: [diagnostic(
        'graph-shape-invalid',
        'Graph data must contain a string id, node objects with id and label, and edge objects with from and to.',
        'Validate the document against graphJsonSchema and correct the reported structure before opening it.',
        path,
      )],
    }
  }
  try {
    const graph = normalizeGraph(value)
    return { compatible: true, document: { format: 'orbweaver-graph', version: contractVersions.graph, graph }, diagnostics: [] }
  } catch (error) {
    if (error instanceof GraphValidationError) {
      return {
        compatible: false,
        diagnostics: error.issues.map((entry) => diagnostic(
          entry.code,
          entry.message,
          'Correct the referenced semantic entity and validate the graph again.',
          path,
        )),
      }
    }
    return {
      compatible: false,
      diagnostics: [diagnostic('graph-read-failed', 'Graph data could not be normalized.', 'Confirm that the document is JSON-compatible and try again.', path)],
    }
  }
}

export function createGraphDocument(graph: Graph): GraphDocument {
  return { format: 'orbweaver-graph', version: contractVersions.graph, graph: normalizeGraph(graph) }
}

export function readGraphDocument(value: unknown): ContractReadResult<GraphDocument> {
  if (record(value) && 'format' in value) {
    if (value.format !== 'orbweaver-graph') {
      return {
        compatible: false,
        diagnostics: [diagnostic('contract-format-unsupported', `Expected format "orbweaver-graph" but received "${String(value.format)}".`, 'Select the reader that matches the document format.', '$.format')],
      }
    }
    const compatibility = inspectContractVersion('graph', value.version)
    if (!compatibility.compatible) return { compatible: false, diagnostics: compatibility.diagnostics }
    return normalizeUnknownGraph(value.graph, '$.graph')
  }

  const migrated = normalizeUnknownGraph(value, '$')
  if (!migrated.compatible) return migrated
  const compatibility = inspectContractVersion('graph', undefined, { allowUnversioned: true })
  return { ...migrated, diagnostics: compatibility.diagnostics }
}

function finitePositive(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

function finite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function rectangle(value: unknown, idKey: 'nodeId' | 'groupId'): boolean {
  return record(value)
    && typeof value[idKey] === 'string'
    && finite(value.x)
    && finite(value.y)
    && finitePositive(value.width)
    && finitePositive(value.height)
}

function point(value: unknown): boolean {
  return record(value) && finite(value.x) && finite(value.y)
}

function sceneEdge(value: unknown): boolean {
  return record(value)
    && typeof value.edgeId === 'string'
    && Array.isArray(value.points)
    && value.points.length >= 2
    && value.points.every(point)
    && (value.label === undefined || record(value.label)
      && finite(value.label.x)
      && finite(value.label.y)
      && finitePositive(value.label.width)
      && finitePositive(value.label.height))
}

function sceneShape(value: unknown): value is Scene {
  return record(value)
    && finitePositive(value.width)
    && finitePositive(value.height)
    && Array.isArray(value.nodes) && value.nodes.every((item) => rectangle(item, 'nodeId'))
    && Array.isArray(value.edges) && value.edges.every(sceneEdge)
    && Array.isArray(value.groups) && value.groups.every((item) => rectangle(item, 'groupId'))
    && graphShape(value.graph)
}

export function createSceneDocument(scene: Scene): SceneDocument {
  const result = readSceneDocument({ format: 'orbweaver-scene', version: contractVersions.scene, scene })
  if (!result.compatible) throw new ContractCompatibilityError(result.diagnostics)
  return result.document
}

export function readSceneDocument(value: unknown): ContractReadResult<SceneDocument> {
  let candidate: unknown = value
  let versionDiagnostics: CompatibilityDiagnostic[]
  if (record(value) && 'format' in value) {
    if (value.format !== 'orbweaver-scene') {
      return {
        compatible: false,
        diagnostics: [diagnostic('contract-format-unsupported', `Expected format "orbweaver-scene" but received "${String(value.format)}".`, 'Select the reader that matches the document format.', '$.format')],
      }
    }
    const compatibility = inspectContractVersion('scene', value.version)
    if (!compatibility.compatible) return { compatible: false, diagnostics: compatibility.diagnostics }
    versionDiagnostics = compatibility.diagnostics
    candidate = value.scene
  } else {
    versionDiagnostics = inspectContractVersion('scene', undefined, { allowUnversioned: true }).diagnostics
  }

  if (!sceneShape(candidate)) {
    return {
      compatible: false,
      diagnostics: [diagnostic('scene-shape-invalid', 'Scene data must contain positive dimensions, node, edge, and group arrays, and a valid graph.', 'Regenerate the scene from its semantic graph with a compatible Orbweaver release.', record(value) && 'format' in value ? '$.scene' : '$')],
    }
  }
  const graph = normalizeUnknownGraph(candidate.graph, record(value) && 'format' in value ? '$.scene.graph' : '$.graph')
  if (!graph.compatible) return graph
  const normalized: Scene = { ...structuredClone(candidate), graph: graph.document.graph }
  return { compatible: true, document: { format: 'orbweaver-scene', version: contractVersions.scene, scene: normalized }, diagnostics: versionDiagnostics }
}

export function graphFromDocument(document: GraphDocument): NormalizedGraph {
  return structuredClone(document.graph)
}

export function sceneFromDocument(document: SceneDocument): Scene {
  return structuredClone(document.scene)
}
