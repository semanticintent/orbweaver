import type { Annotation, Graph, Group } from '../model/types.js'
import type { ValidationIssue, ValidationResult } from './types.js'

function issue(
  severity: ValidationIssue['severity'],
  code: string,
  message: string,
  entity?: ValidationIssue['entity'],
): ValidationIssue {
  return entity === undefined
    ? { severity, code, message }
    : { severity, code, message, entity }
}

function duplicateIds(values: readonly { id: string }[]): Set<string> {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const value of values) {
    if (seen.has(value.id)) duplicates.add(value.id)
    seen.add(value.id)
  }
  return duplicates
}

function groupCycles(groups: readonly Group[]): string[][] {
  const parents = new Map(groups.map((group) => [group.id, group.parent]))
  const cycles: string[][] = []
  const reported = new Set<string>()

  for (const group of groups) {
    const path: string[] = []
    const positions = new Map<string, number>()
    let current: string | undefined = group.id

    while (current !== undefined && parents.has(current)) {
      const position = positions.get(current)
      if (position !== undefined) {
        const cycle = path.slice(position)
        const key = [...cycle].sort().join('\u0000')
        if (!reported.has(key)) {
          cycles.push(cycle)
          reported.add(key)
        }
        break
      }
      positions.set(current, path.length)
      path.push(current)
      current = parents.get(current)
    }
  }

  return cycles
}

function validateAnnotationTarget(
  annotation: Annotation,
  nodeIds: ReadonlySet<string>,
  groupIds: ReadonlySet<string>,
  edgeIds: ReadonlySet<string>,
): ValidationIssue | undefined {
  const target = annotation.target
  if (target === undefined || target.kind === 'graph') return undefined
  if (target.id === undefined || target.id.trim() === '') {
    return issue('error', 'annotation-target-id-required', `Annotation "${annotation.id}" has no target ID.`, {
      kind: 'annotation',
      id: annotation.id,
    })
  }

  const exists =
    target.kind === 'node'
      ? nodeIds.has(target.id)
      : target.kind === 'group'
        ? groupIds.has(target.id)
        : edgeIds.has(target.id)

  if (exists) return undefined
  return issue(
    'error',
    'annotation-target-missing',
    `Annotation "${annotation.id}" references missing ${target.kind} "${target.id}".`,
    { kind: 'annotation', id: annotation.id },
  )
}

export function validateGraph(graph: Graph): ValidationResult {
  const errors: ValidationIssue[] = []
  const warnings: ValidationIssue[] = []
  const groups = graph.groups ?? []
  const annotations = graph.annotations ?? []

  if (graph.id.trim() === '') {
    errors.push(issue('error', 'graph-id-empty', 'Graph ID must not be empty.', { kind: 'graph', id: graph.id }))
  }

  for (const id of duplicateIds(graph.nodes)) {
    errors.push(issue('error', 'node-id-duplicate', `Duplicate node ID "${id}".`, { kind: 'node', id }))
  }
  for (const id of duplicateIds(groups)) {
    errors.push(issue('error', 'group-id-duplicate', `Duplicate group ID "${id}".`, { kind: 'group', id }))
  }
  for (const id of duplicateIds(annotations)) {
    errors.push(issue('error', 'annotation-id-duplicate', `Duplicate annotation ID "${id}".`, { kind: 'annotation', id }))
  }

  const explicitEdges = graph.edges.filter((edge): edge is typeof edge & { id: string } => edge.id !== undefined)
  for (const id of duplicateIds(explicitEdges)) {
    errors.push(issue('error', 'edge-id-duplicate', `Duplicate edge ID "${id}".`, { kind: 'edge', id }))
  }

  const nodeIds = new Set(graph.nodes.map((node) => node.id))
  const groupIds = new Set(groups.map((group) => group.id))
  const explicitEdgeIds = new Set(explicitEdges.map((edge) => edge.id))
  const incidentNodes = new Set<string>()
  const semanticEdges = new Set<string>()

  for (const node of graph.nodes) {
    if (node.id.trim() === '') {
      errors.push(issue('error', 'node-id-empty', 'Node ID must not be empty.', { kind: 'node', id: node.id }))
    }
    if (node.label.trim() === '') {
      warnings.push(issue('warning', 'node-label-empty', `Node "${node.id}" has an empty label.`, { kind: 'node', id: node.id }))
    }
    if (node.group !== undefined && !groupIds.has(node.group)) {
      errors.push(issue('error', 'node-group-missing', `Node "${node.id}" references missing group "${node.group}".`, { kind: 'node', id: node.id }))
    }
  }

  graph.edges.forEach((edge, index) => {
    const edgeId = edge.id ?? `edge:${index}`
    if (!nodeIds.has(edge.from)) {
      errors.push(issue('error', 'edge-source-missing', `Edge "${edgeId}" references missing source node "${edge.from}".`, { kind: 'edge', id: edgeId }))
    } else {
      incidentNodes.add(edge.from)
    }
    if (!nodeIds.has(edge.to)) {
      errors.push(issue('error', 'edge-target-missing', `Edge "${edgeId}" references missing target node "${edge.to}".`, { kind: 'edge', id: edgeId }))
    } else {
      incidentNodes.add(edge.to)
    }
    if (edge.from === edge.to) {
      warnings.push(issue('warning', 'edge-self-reference', `Edge "${edgeId}" connects node "${edge.from}" to itself.`, { kind: 'edge', id: edgeId }))
    }
    const semanticKey = `${edge.from}\u0000${edge.to}\u0000${edge.type ?? ''}\u0000${edge.label ?? ''}`
    if (semanticEdges.has(semanticKey)) {
      warnings.push(issue('warning', 'edge-semantic-duplicate', `Edge "${edgeId}" duplicates an existing semantic relationship.`, { kind: 'edge', id: edgeId }))
    }
    semanticEdges.add(semanticKey)
  })

  for (const group of groups) {
    if (group.parent !== undefined && !groupIds.has(group.parent)) {
      errors.push(issue('error', 'group-parent-missing', `Group "${group.id}" references missing parent group "${group.parent}".`, { kind: 'group', id: group.id }))
    }
    const hasMembers = graph.nodes.some((node) => node.group === group.id)
      || groups.some((candidate) => candidate.parent === group.id)
    if (!hasMembers) {
      warnings.push(issue('warning', 'group-empty', `Group "${group.id}" has no members.`, { kind: 'group', id: group.id }))
    }
  }

  for (const cycle of groupCycles(groups)) {
    const id = cycle[0] ?? ''
    errors.push(issue('error', 'group-parent-cycle', `Group parent cycle detected: ${cycle.join(' → ')} → ${id}.`, { kind: 'group', id }))
  }

  for (const node of graph.nodes) {
    if (!incidentNodes.has(node.id)) {
      warnings.push(issue('warning', 'node-disconnected', `Node "${node.id}" is disconnected.`, { kind: 'node', id: node.id }))
    }
  }

  for (const annotation of annotations) {
    const targetIssue = validateAnnotationTarget(annotation, nodeIds, groupIds, explicitEdgeIds)
    if (targetIssue !== undefined) errors.push(targetIssue)
  }

  return { valid: errors.length === 0, errors, warnings }
}
