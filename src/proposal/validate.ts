import type { Graph } from '../model/types.js'
import { validateGraph } from '../validation/validate.js'
import type {
  GraphProposal,
  ProposalValidationIssue,
  ProposalValidationLimits,
  ProposalValidationOptions,
  ProposalValidationResult,
} from './types.js'

export const defaultProposalValidationLimits: ProposalValidationLimits = {
  maxBytes: 1024 * 1024,
  maxNodes: 250,
  maxEdges: 500,
  maxGroups: 50,
  maxAnnotations: 500,
  maxEvidence: 500,
  maxClaims: 1000,
  maxLabelLength: 200,
  maxDescriptionLength: 2000,
  maxMetadataDepth: 8,
}

const forbiddenFields = new Set([
  'x', 'y', 'width', 'height', 'position', 'positions', 'point', 'points',
  'coordinates', 'svg', 'html', 'css', 'style', 'styles', 'transform',
  'viewbox', 'dangerouslysetinnerhtml', 'markup',
])

const executableMarkup = /<\s*(?:script|style|iframe|object|embed|svg|img|link|meta)\b|\bon[a-z]+\s*=/i

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function addIssue(
  target: ProposalValidationIssue[],
  code: string,
  message: string,
  path: string,
  entity?: ProposalValidationIssue['entity'],
): void {
  target.push(entity === undefined
    ? { code, severity: 'error', message, path }
    : { code, severity: 'error', message, path, entity })
}

function requireString(
  record: Record<string, unknown>,
  key: string,
  path: string,
  errors: ProposalValidationIssue[],
): boolean {
  if (typeof record[key] === 'string') return true
  addIssue(errors, 'proposal-type-invalid', `Expected "${key}" to be a string.`, `${path}.${key}`)
  return false
}

function optionalString(
  record: Record<string, unknown>,
  key: string,
  path: string,
  errors: ProposalValidationIssue[],
): void {
  if (record[key] !== undefined && typeof record[key] !== 'string') {
    addIssue(errors, 'proposal-type-invalid', `Expected "${key}" to be a string.`, `${path}.${key}`)
  }
}

function optionalRecord(
  record: Record<string, unknown>,
  key: string,
  path: string,
  errors: ProposalValidationIssue[],
): void {
  if (record[key] !== undefined && !isRecord(record[key])) {
    addIssue(errors, 'proposal-type-invalid', `Expected "${key}" to be an object.`, `${path}.${key}`)
  }
}

function rejectUnknownFields(
  record: Record<string, unknown>,
  allowed: ReadonlySet<string>,
  path: string,
  errors: ProposalValidationIssue[],
): void {
  for (const key of Object.keys(record)) {
    if (!allowed.has(key)) addIssue(errors, 'proposal-field-unknown', `Unknown field "${key}".`, `${path}.${key}`)
  }
}

function validateEntityArray(
  value: unknown,
  path: string,
  required: readonly string[],
  allowed: ReadonlySet<string>,
  errors: ProposalValidationIssue[],
): value is Record<string, unknown>[] {
  if (!Array.isArray(value)) {
    addIssue(errors, 'proposal-type-invalid', `Expected ${path} to be an array.`, path)
    return false
  }
  let valid = true
  value.forEach((entry, index) => {
    const entryPath = `${path}[${index}]`
    if (!isRecord(entry)) {
      addIssue(errors, 'proposal-type-invalid', 'Expected an object.', entryPath)
      valid = false
      return
    }
    rejectUnknownFields(entry, allowed, entryPath, errors)
    for (const key of required) {
      if (!requireString(entry, key, entryPath, errors)) valid = false
    }
  })
  return valid
}

function metadataDepth(value: unknown, depth = 0, seen = new WeakSet<object>()): number {
  if (value === null || typeof value !== 'object') return depth
  if (seen.has(value)) return depth
  seen.add(value)
  const children = Array.isArray(value) ? value : Object.values(value as Record<string, unknown>)
  return children.reduce((maximum, child) => Math.max(maximum, metadataDepth(child, depth + 1, seen)), depth)
}

function inspectUntrustedValue(
  value: unknown,
  path: string,
  errors: ProposalValidationIssue[],
  parentKey?: string,
  seen = new WeakSet<object>(),
): void {
  if (typeof value === 'string' && executableMarkup.test(value)) {
    addIssue(errors, 'proposal-markup-forbidden', 'Executable markup is not allowed in graph proposals.', path)
    return
  }
  if (Array.isArray(value)) {
    if (seen.has(value)) return
    seen.add(value)
    value.forEach((entry, index) => inspectUntrustedValue(entry, `${path}[${index}]`, errors, parentKey, seen))
    return
  }
  if (!isRecord(value)) return
  if (seen.has(value)) return
  seen.add(value)
  for (const [key, child] of Object.entries(value)) {
    const lower = key.toLowerCase()
    const isTrustedProvenancePath = parentKey === 'source' && key === 'path'
    if (forbiddenFields.has(lower) && !isTrustedProvenancePath) {
      addIssue(errors, 'proposal-field-forbidden', `Field "${key}" is not semantic graph data.`, `${path}.${key}`)
    }
    inspectUntrustedValue(child, `${path}.${key}`, errors, key, seen)
  }
}

function validateGraphShape(value: unknown, errors: ProposalValidationIssue[]): value is Graph {
  const path = '$.graph'
  if (!isRecord(value)) {
    addIssue(errors, 'proposal-graph-required', 'Proposal graph must be an object.', path)
    return false
  }
  rejectUnknownFields(value, new Set([
    'id', 'title', 'description', 'nodes', 'edges', 'groups', 'annotations', 'metadata', 'options',
  ]), path, errors)
  requireString(value, 'id', path, errors)
  optionalString(value, 'title', path, errors)
  optionalString(value, 'description', path, errors)
  const nodesValid = validateEntityArray(value.nodes, `${path}.nodes`, ['id', 'label'], new Set([
    'id', 'type', 'label', 'description', 'group', 'layer', 'status', 'value', 'metadata', 'source',
  ]), errors)
  if (Array.isArray(value.nodes)) {
    value.nodes.forEach((node, index) => {
      if (!isRecord(node)) return
      const nodePath = `${path}.nodes[${index}]`
      for (const key of ['type', 'description', 'group', 'layer', 'status']) optionalString(node, key, nodePath, errors)
      if (node.value !== undefined && typeof node.value !== 'string' && typeof node.value !== 'number') {
        addIssue(errors, 'proposal-type-invalid', 'Expected "value" to be a string or number.', `${nodePath}.value`)
      }
      optionalRecord(node, 'metadata', nodePath, errors)
      optionalRecord(node, 'source', nodePath, errors)
    })
  }
  const edgesValid = validateEntityArray(value.edges, `${path}.edges`, ['from', 'to'], new Set([
    'id', 'from', 'to', 'type', 'label', 'direction', 'metadata', 'source',
  ]), errors)
  if (Array.isArray(value.edges)) {
    value.edges.forEach((edge, index) => {
      if (!isRecord(edge)) return
      const edgePath = `${path}.edges[${index}]`
      for (const key of ['id', 'type', 'label', 'direction']) optionalString(edge, key, edgePath, errors)
      optionalRecord(edge, 'metadata', edgePath, errors)
      optionalRecord(edge, 'source', edgePath, errors)
    })
  }
  let groupsValid = true
  if (value.groups !== undefined) {
    groupsValid = validateEntityArray(value.groups, `${path}.groups`, ['id', 'label'], new Set([
      'id', 'label', 'description', 'parent', 'type', 'metadata', 'source',
    ]), errors)
    if (Array.isArray(value.groups)) {
      value.groups.forEach((group, index) => {
        if (!isRecord(group)) return
        const groupPath = `${path}.groups[${index}]`
        for (const key of ['description', 'parent', 'type']) optionalString(group, key, groupPath, errors)
        optionalRecord(group, 'metadata', groupPath, errors)
        optionalRecord(group, 'source', groupPath, errors)
      })
    }
  }
  let annotationsValid = true
  if (value.annotations !== undefined) {
    annotationsValid = validateEntityArray(value.annotations, `${path}.annotations`, ['id', 'body'], new Set([
      'id', 'target', 'label', 'body', 'type', 'severity', 'metadata', 'source',
    ]), errors)
    if (Array.isArray(value.annotations)) {
      value.annotations.forEach((annotation, index) => {
        if (!isRecord(annotation)) return
        const annotationPath = `${path}.annotations[${index}]`
        for (const key of ['label', 'type', 'severity']) optionalString(annotation, key, annotationPath, errors)
        optionalRecord(annotation, 'target', annotationPath, errors)
        if (annotation.severity !== undefined && !['info', 'warning', 'critical'].includes(String(annotation.severity))) {
          addIssue(errors, 'proposal-annotation-severity-invalid', 'Annotation severity must be info, warning, or critical.', `${annotationPath}.severity`)
        }
        if (isRecord(annotation.target)) {
          rejectUnknownFields(annotation.target, new Set(['kind', 'id']), `${annotationPath}.target`, errors)
          if (!['graph', 'node', 'edge', 'group'].includes(String(annotation.target.kind))) {
            addIssue(errors, 'proposal-annotation-target-kind-invalid', 'Annotation target kind must be graph, node, edge, or group.', `${annotationPath}.target.kind`)
          }
          if (annotation.target.kind !== 'graph') requireString(annotation.target, 'id', `${annotationPath}.target`, errors)
          else optionalString(annotation.target, 'id', `${annotationPath}.target`, errors)
        }
        optionalRecord(annotation, 'metadata', annotationPath, errors)
        optionalRecord(annotation, 'source', annotationPath, errors)
      })
    }
  }
  optionalRecord(value, 'metadata', path, errors)
  optionalRecord(value, 'options', path, errors)
  return nodesValid && edgesValid && groupsValid && annotationsValid
}

function validateEnvelopeShape(value: unknown, errors: ProposalValidationIssue[]): value is GraphProposal {
  if (!isRecord(value)) {
    addIssue(errors, 'proposal-object-required', 'Graph proposal must be an object.', '$')
    return false
  }
  rejectUnknownFields(value, new Set(['schemaVersion', 'graph', 'generation', 'evidence', 'claims', 'warnings']), '$', errors)
  if (value.schemaVersion !== '1') {
    addIssue(errors, 'proposal-schema-version-unsupported', 'Expected schemaVersion "1".', '$.schemaVersion')
  }
  const graphValid = validateGraphShape(value.graph, errors)

  if (!isRecord(value.generation)) {
    addIssue(errors, 'proposal-generation-required', 'Generation metadata must be an object.', '$.generation')
  } else {
    rejectUnknownFields(value.generation, new Set(['provider', 'model', 'adapter']), '$.generation', errors)
    requireString(value.generation, 'adapter', '$.generation', errors)
    optionalString(value.generation, 'provider', '$.generation', errors)
    optionalString(value.generation, 'model', '$.generation', errors)
  }

  const evidenceIds = new Set<string>()
  if (value.evidence !== undefined) {
    if (validateEntityArray(value.evidence, '$.evidence', ['id', 'label'], new Set([
      'id', 'label', 'source', 'location',
    ]), errors)) {
      value.evidence.forEach((evidence, index) => {
        const id = evidence.id
        if (typeof id !== 'string') return
        if (evidenceIds.has(id)) addIssue(errors, 'proposal-evidence-id-duplicate', `Duplicate evidence ID "${id}".`, `$.evidence[${index}].id`)
        evidenceIds.add(id)
        optionalString(evidence, 'source', `$.evidence[${index}]`, errors)
        optionalString(evidence, 'location', `$.evidence[${index}]`, errors)
      })
    }
  }

  if (value.claims !== undefined) {
    if (!Array.isArray(value.claims)) {
      addIssue(errors, 'proposal-type-invalid', 'Expected claims to be an array.', '$.claims')
    } else {
      value.claims.forEach((claim, index) => {
        const path = `$.claims[${index}]`
        if (!isRecord(claim)) {
          addIssue(errors, 'proposal-type-invalid', 'Expected a claim object.', path)
          return
        }
        rejectUnknownFields(claim, new Set(['entity', 'evidenceIds', 'confidence', 'rationale']), path, errors)
        if (!isRecord(claim.entity)) {
          addIssue(errors, 'proposal-claim-entity-invalid', 'Claim entity must be an object.', `${path}.entity`)
        } else {
          rejectUnknownFields(claim.entity, new Set(['kind', 'id']), `${path}.entity`, errors)
          if (!['node', 'edge', 'group'].includes(String(claim.entity.kind))) {
            addIssue(errors, 'proposal-claim-kind-invalid', 'Claim entity kind must be node, edge, or group.', `${path}.entity.kind`)
          }
          requireString(claim.entity, 'id', `${path}.entity`, errors)
        }
        if (!Array.isArray(claim.evidenceIds) || claim.evidenceIds.some((id) => typeof id !== 'string')) {
          addIssue(errors, 'proposal-claim-evidence-invalid', 'Claim evidenceIds must be an array of strings.', `${path}.evidenceIds`)
        } else {
          claim.evidenceIds.forEach((id) => {
            if (!evidenceIds.has(id)) addIssue(errors, 'proposal-claim-evidence-missing', `Claim references missing evidence "${id}".`, `${path}.evidenceIds`)
          })
        }
        if (claim.confidence !== undefined && !['low', 'medium', 'high'].includes(String(claim.confidence))) {
          addIssue(errors, 'proposal-claim-confidence-invalid', 'Claim confidence must be low, medium, or high.', `${path}.confidence`)
        }
        optionalString(claim, 'rationale', path, errors)
      })
    }
  }

  if (value.warnings !== undefined && (!Array.isArray(value.warnings) || value.warnings.some((warning) => typeof warning !== 'string'))) {
    addIssue(errors, 'proposal-warnings-invalid', 'Proposal warnings must be an array of strings.', '$.warnings')
  }
  return graphValid && errors.length === 0
}

function applyLimits(
  proposal: GraphProposal,
  byteLength: number,
  limits: ProposalValidationLimits,
  errors: ProposalValidationIssue[],
): void {
  const checks: Array<[number, number, string, string, string]> = [
    [byteLength, limits.maxBytes, 'proposal-bytes-limit', '$', 'Proposal bytes'],
    [proposal.graph.nodes.length, limits.maxNodes, 'proposal-nodes-limit', '$.graph.nodes', 'Nodes'],
    [proposal.graph.edges.length, limits.maxEdges, 'proposal-edges-limit', '$.graph.edges', 'Edges'],
    [proposal.graph.groups?.length ?? 0, limits.maxGroups, 'proposal-groups-limit', '$.graph.groups', 'Groups'],
    [proposal.graph.annotations?.length ?? 0, limits.maxAnnotations, 'proposal-annotations-limit', '$.graph.annotations', 'Annotations'],
    [proposal.evidence?.length ?? 0, limits.maxEvidence, 'proposal-evidence-limit', '$.evidence', 'Evidence references'],
    [proposal.claims?.length ?? 0, limits.maxClaims, 'proposal-claims-limit', '$.claims', 'Claims'],
  ]
  for (const [actual, maximum, code, path, label] of checks) {
    if (actual > maximum) addIssue(errors, code, `${label} exceed the limit of ${maximum} (received ${actual}).`, path)
  }

  const labels: Array<[string | undefined, string]> = [
    [proposal.graph.title, '$.graph.title'],
    ...proposal.graph.nodes.map((node, index): [string, string] => [node.label, `$.graph.nodes[${index}].label`]),
    ...(proposal.graph.groups ?? []).map((group, index): [string, string] => [group.label, `$.graph.groups[${index}].label`]),
    ...(proposal.graph.edges).map((edge, index): [string | undefined, string] => [edge.label, `$.graph.edges[${index}].label`]),
    ...(proposal.graph.annotations ?? []).map((annotation, index): [string | undefined, string] => [annotation.label, `$.graph.annotations[${index}].label`]),
    ...(proposal.evidence ?? []).map((evidence, index): [string, string] => [evidence.label, `$.evidence[${index}].label`]),
  ]
  for (const [label, path] of labels) {
    if (label !== undefined && label.length > limits.maxLabelLength) {
      addIssue(errors, 'proposal-label-length-limit', `Label exceeds ${limits.maxLabelLength} characters.`, path)
    }
  }
  const descriptions: Array<[string | undefined, string]> = [
    [proposal.graph.description, '$.graph.description'],
    ...proposal.graph.nodes.map((node, index): [string | undefined, string] => [node.description, `$.graph.nodes[${index}].description`]),
    ...(proposal.graph.groups ?? []).map((group, index): [string | undefined, string] => [group.description, `$.graph.groups[${index}].description`]),
    ...(proposal.graph.annotations ?? []).map((annotation, index): [string, string] => [annotation.body, `$.graph.annotations[${index}].body`]),
    ...(proposal.claims ?? []).map((claim, index): [string | undefined, string] => [claim.rationale, `$.claims[${index}].rationale`]),
  ]
  for (const [description, path] of descriptions) {
    if (description !== undefined && description.length > limits.maxDescriptionLength) {
      addIssue(errors, 'proposal-description-length-limit', `Description exceeds ${limits.maxDescriptionLength} characters.`, path)
    }
  }

  const metadataValues: Array<[unknown, string]> = []
  const seenMetadataContainers = new WeakSet<object>()
  function collectMetadata(value: unknown, path: string): void {
    if (value !== null && typeof value === 'object') {
      if (seenMetadataContainers.has(value)) return
      seenMetadataContainers.add(value)
    }
    if (Array.isArray(value)) {
      value.forEach((entry, index) => collectMetadata(entry, `${path}[${index}]`))
      return
    }
    if (!isRecord(value)) return
    for (const [key, child] of Object.entries(value)) {
      const childPath = `${path}.${key}`
      if (key === 'metadata') metadataValues.push([child, childPath])
      else collectMetadata(child, childPath)
    }
  }
  collectMetadata(proposal.graph, '$.graph')
  for (const [metadata, path] of metadataValues) {
    if (metadata !== undefined && metadataDepth(metadata) > limits.maxMetadataDepth) {
      addIssue(errors, 'proposal-metadata-depth-limit', `Metadata exceeds ${limits.maxMetadataDepth} levels.`, path)
    }
  }
}

function validateClaimEntities(proposal: GraphProposal, errors: ProposalValidationIssue[]): void {
  const nodes = new Set(proposal.graph.nodes.map((node) => node.id))
  const groups = new Set((proposal.graph.groups ?? []).map((group) => group.id))
  const edges = new Set(proposal.graph.edges.flatMap((edge) => edge.id === undefined ? [] : [edge.id]))
  proposal.claims?.forEach((claim, index) => {
    const collection = claim.entity.kind === 'node' ? nodes : claim.entity.kind === 'group' ? groups : edges
    if (!collection.has(claim.entity.id)) {
      addIssue(
        errors,
        'proposal-claim-entity-missing',
        `Claim references missing ${claim.entity.kind} "${claim.entity.id}".`,
        `$.claims[${index}].entity.id`,
        { kind: 'claim', id: String(index) },
      )
    }
  })
}

export function validateGraphProposal(
  input: unknown,
  options: ProposalValidationOptions = {},
): ProposalValidationResult {
  const errors: ProposalValidationIssue[] = []
  const warnings: ProposalValidationIssue[] = []
  let byteLength = 0
  try {
    byteLength = new TextEncoder().encode(JSON.stringify(input)).byteLength
  } catch {
    addIssue(errors, 'proposal-not-serializable', 'Graph proposal must be JSON-serializable.', '$')
  }

  inspectUntrustedValue(input, '$', errors)
  const shapeValid = validateEnvelopeShape(input, errors)
  if (!shapeValid || !isRecord(input)) return { valid: false, errors, warnings }
  const proposal = input as unknown as GraphProposal
  const limits = { ...defaultProposalValidationLimits, ...options.limits }
  applyLimits(proposal, byteLength, limits, errors)
  validateClaimEntities(proposal, errors)

  const graphResult = validateGraph(proposal.graph)
  for (const graphIssue of [...graphResult.errors, ...graphResult.warnings]) {
    const target = graphIssue.severity === 'error' ? errors : warnings
    target.push({ ...graphIssue, path: '$.graph' })
  }

  if (errors.length > 0) return { valid: false, errors, warnings }
  return { valid: true, errors, warnings, proposal }
}
