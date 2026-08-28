import { getGroupNodes } from '../graph/queries.js'
import type { Annotation, Metadata, NormalizedGraph } from '../model/types.js'
import type { EntityRef, InspectableEntityKind } from '../interaction/inspection.js'

export type SemanticLensId = 'risk' | 'trust' | 'data-flow' | 'provenance' | 'ownership' | 'modernization'
export type LensProjectionRole = 'match' | 'context' | 'background'

export interface SemanticLensMetadataRule {
  key: string
  value?: string | number | boolean | null
}

export interface SemanticLensAnnotationRule {
  type?: string | string[]
  severity?: string | string[]
  metadata?: SemanticLensMetadataRule
}

export interface SemanticLensRule {
  entity?: InspectableEntityKind | InspectableEntityKind[]
  type?: string | string[]
  status?: string | string[]
  metadata?: SemanticLensMetadataRule
  source?: 'present' | 'absent'
  annotation?: SemanticLensAnnotationRule
  reason: string
}

export interface SemanticLens {
  id: string
  label: string
  rules: SemanticLensRule[]
  context?: {
    relationshipHops?: 0 | 1 | 2
    includeGroups?: boolean
  }
}

export interface LensReason {
  code: 'rule-match' | 'relationship-context' | 'endpoint-context' | 'group-context' | 'member-context'
  message: string
  ruleIndex?: number
  annotationId?: string
}

export interface LensMatch {
  entity: EntityRef
  role: LensProjectionRole
  reasons: LensReason[]
}

export interface LensProjection {
  lensId: string
  label: string
  matches: LensMatch[]
  matchCount: number
  contextCount: number
}

function values(value: string | string[] | undefined): string[] | undefined {
  return value === undefined ? undefined : Array.isArray(value) ? value : [value]
}

function metadataMatches(metadata: Metadata | undefined, rule: SemanticLensMetadataRule | undefined): boolean {
  if (rule === undefined) return true
  if (metadata === undefined || !(rule.key in metadata)) return false
  return rule.value === undefined || metadata[rule.key] === rule.value
}

function annotationMatches(annotation: Annotation, rule: SemanticLensAnnotationRule): boolean {
  const types = values(rule.type)
  if (types !== undefined && !types.includes(annotation.type ?? 'note')) return false
  const severities = values(rule.severity)
  if (severities !== undefined && !severities.includes(annotation.severity ?? 'info')) return false
  return metadataMatches(annotation.metadata, rule.metadata)
}

function entityAnnotations(graph: NormalizedGraph, ref: EntityRef): Annotation[] {
  return (graph.annotations ?? []).filter((annotation) =>
    annotation.target?.kind === ref.kind && annotation.target.id === ref.id,
  )
}

function entityData(graph: NormalizedGraph, ref: EntityRef) {
  if (ref.kind === 'node') return graph.nodes.find((entity) => entity.id === ref.id)
  if (ref.kind === 'edge') return graph.edges.find((entity) => entity.id === ref.id)
  return graph.groups?.find((entity) => entity.id === ref.id)
}

function ruleMatches(graph: NormalizedGraph, ref: EntityRef, rule: SemanticLensRule): Annotation[] | undefined {
  const kinds = rule.entity === undefined ? undefined : Array.isArray(rule.entity) ? rule.entity : [rule.entity]
  if (kinds !== undefined && !kinds.includes(ref.kind)) return undefined
  const entity = entityData(graph, ref)
  if (entity === undefined) return undefined
  const types = values(rule.type)
  if (types !== undefined && !types.includes(entity.type ?? 'generic')) return undefined
  const statuses = values(rule.status)
  const status = 'status' in entity ? entity.status : undefined
  if (statuses !== undefined && !statuses.includes(status ?? 'default')) return undefined
  if (!metadataMatches(entity.metadata, rule.metadata)) return undefined
  if (rule.source === 'present' && entity.source === undefined) return undefined
  if (rule.source === 'absent' && entity.source !== undefined) return undefined
  if (rule.annotation === undefined) return []
  const annotations = entityAnnotations(graph, ref).filter((annotation) => annotationMatches(annotation, rule.annotation!))
  return annotations.length === 0 ? undefined : annotations
}

function entityRefs(graph: NormalizedGraph): EntityRef[] {
  return [
    ...graph.nodes.map((node): EntityRef => ({ kind: 'node', id: node.id })),
    ...graph.edges.map((edge): EntityRef => ({ kind: 'edge', id: edge.id })),
    ...(graph.groups ?? []).map((group): EntityRef => ({ kind: 'group', id: group.id })),
  ]
}

function key(ref: EntityRef): string {
  return `${ref.kind}:${ref.id}`
}

function addContext(
  roles: Map<string, LensProjectionRole>,
  reasons: Map<string, LensReason[]>,
  ref: EntityRef,
  reason: LensReason,
): boolean {
  const entityKey = key(ref)
  if (roles.get(entityKey) === 'match') return false
  const changed = roles.get(entityKey) !== 'context'
  roles.set(entityKey, 'context')
  const current = reasons.get(entityKey) ?? []
  if (!current.some((candidate) => candidate.code === reason.code && candidate.message === reason.message)) {
    current.push(reason)
    reasons.set(entityKey, current)
  }
  return changed
}

function addStructuralContext(
  graph: NormalizedGraph,
  directMatches: readonly EntityRef[],
  roles: Map<string, LensProjectionRole>,
  reasons: Map<string, LensReason[]>,
  includeGroups: boolean,
): void {
  for (const ref of directMatches) {
    if (ref.kind === 'edge') {
      const edge = graph.edges.find((candidate) => candidate.id === ref.id)
      if (edge === undefined) continue
      addContext(roles, reasons, { kind: 'node', id: edge.from }, {
        code: 'endpoint-context', message: `Endpoint of matching relationship ${edge.id}.`,
      })
      addContext(roles, reasons, { kind: 'node', id: edge.to }, {
        code: 'endpoint-context', message: `Endpoint of matching relationship ${edge.id}.`,
      })
    }
    if (ref.kind === 'group') {
      for (const node of getGroupNodes(graph, ref.id)) {
        addContext(roles, reasons, { kind: 'node', id: node.id }, {
          code: 'member-context', message: `Member of matching group ${ref.id}.`,
        })
      }
    }
  }
  if (!includeGroups) return
  for (const node of graph.nodes) {
    if (node.group === undefined || roles.get(`node:${node.id}`) === 'background') continue
    addContext(roles, reasons, { kind: 'group', id: node.group }, {
      code: 'group-context', message: `Contains emphasized node ${node.id}.`,
    })
  }
}

function addRelationshipContext(
  graph: NormalizedGraph,
  seedNodes: readonly string[],
  hops: 0 | 1 | 2,
  roles: Map<string, LensProjectionRole>,
  reasons: Map<string, LensReason[]>,
): void {
  let frontier = new Set(seedNodes)
  const visited = new Set(seedNodes)
  for (let depth = 1; depth <= hops; depth += 1) {
    const next = new Set<string>()
    for (const edge of graph.edges) {
      const fromActive = frontier.has(edge.from)
      const toActive = frontier.has(edge.to)
      if (!fromActive && !toActive) continue
      addContext(roles, reasons, { kind: 'edge', id: edge.id }, {
        code: 'relationship-context', message: `Relationship hop ${depth} from a lens match.`,
      })
      const neighbor = fromActive ? edge.to : edge.from
      addContext(roles, reasons, { kind: 'node', id: neighbor }, {
        code: 'relationship-context', message: `Node hop ${depth} from a lens match.`,
      })
      if (!visited.has(neighbor)) next.add(neighbor)
    }
    for (const nodeId of next) visited.add(nodeId)
    frontier = next
  }
}

export function deriveLensProjection(graph: NormalizedGraph, lens: SemanticLens): LensProjection {
  const refs = entityRefs(graph)
  const roles = new Map(refs.map((ref) => [key(ref), 'background' as LensProjectionRole]))
  const reasons = new Map<string, LensReason[]>()
  const directMatches: EntityRef[] = []

  for (const ref of refs) {
    lens.rules.forEach((rule, ruleIndex) => {
      const annotations = ruleMatches(graph, ref, rule)
      if (annotations === undefined) return
      const entityKey = key(ref)
      roles.set(entityKey, 'match')
      if (!directMatches.some((candidate) => key(candidate) === entityKey)) directMatches.push(ref)
      const current = reasons.get(entityKey) ?? []
      if (annotations.length === 0) {
        current.push({ code: 'rule-match', message: rule.reason, ruleIndex })
      } else {
        for (const annotation of annotations) {
          current.push({ code: 'rule-match', message: rule.reason, ruleIndex, annotationId: annotation.id })
        }
      }
      reasons.set(entityKey, current)
    })
  }

  addStructuralContext(graph, directMatches, roles, reasons, lens.context?.includeGroups ?? true)
  addRelationshipContext(
    graph,
    directMatches.filter((ref) => ref.kind === 'node').map((ref) => ref.id),
    lens.context?.relationshipHops ?? 1,
    roles,
    reasons,
  )

  const matches = refs.map((entity): LensMatch => ({
    entity,
    role: roles.get(key(entity)) ?? 'background',
    reasons: reasons.get(key(entity)) ?? [],
  }))
  return {
    lensId: lens.id,
    label: lens.label,
    matches,
    matchCount: matches.filter((match) => match.role === 'match').length,
    contextCount: matches.filter((match) => match.role === 'context').length,
  }
}

export function getLensMatch(projection: LensProjection, ref: EntityRef): LensMatch | undefined {
  return projection.matches.find((match) => match.entity.kind === ref.kind && match.entity.id === ref.id)
}

export const semanticLensRecipes: Readonly<Record<SemanticLensId, SemanticLens>> = {
  risk: {
    id: 'risk', label: 'Risk', context: { relationshipHops: 1, includeGroups: true },
    rules: [
      { entity: 'node', status: ['warning', 'critical', 'error'], reason: 'Entity status requires attention.' },
      { annotation: { type: 'risk' }, reason: 'A risk annotation targets this entity.' },
      { annotation: { severity: 'critical' }, reason: 'A critical annotation targets this entity.' },
    ],
  },
  trust: {
    id: 'trust', label: 'Trust', context: { relationshipHops: 1, includeGroups: true },
    rules: [
      { entity: 'node', type: 'external', reason: 'External entities participate in a trust boundary.' },
      { annotation: { type: 'constraint' }, reason: 'A constraint annotation defines a trust condition.' },
      { metadata: { key: 'trustBoundary', value: true }, reason: 'Metadata explicitly declares a trust boundary.' },
    ],
  },
  'data-flow': {
    id: 'data-flow', label: 'Data flow', context: { relationshipHops: 0, includeGroups: true },
    rules: [
      { entity: 'edge', type: ['data', 'event'], reason: 'Relationship carries data or an event.' },
    ],
  },
  provenance: {
    id: 'provenance', label: 'Provenance', context: { relationshipHops: 0, includeGroups: true },
    rules: [
      { source: 'present', reason: 'Entity declares source provenance.' },
      { annotation: { type: 'evidence' }, reason: 'An evidence annotation supports this entity.' },
    ],
  },
  ownership: {
    id: 'ownership', label: 'Ownership', context: { relationshipHops: 0, includeGroups: true },
    rules: [
      { metadata: { key: 'owner' }, reason: 'Entity declares an accountable owner.' },
      { annotation: { metadata: { key: 'topic', value: 'ownership' } }, reason: 'An annotation records ownership.' },
    ],
  },
  modernization: {
    id: 'modernization', label: 'Modernization', context: { relationshipHops: 1, includeGroups: true },
    rules: [
      { annotation: { type: ['change', 'risk'] }, reason: 'A change or risk annotation identifies modernization context.' },
      { metadata: { key: 'lifecycle', value: 'legacy' }, reason: 'Entity lifecycle is legacy.' },
      { metadata: { key: 'lifecycle', value: 'retiring' }, reason: 'Entity lifecycle is retiring.' },
      { metadata: { key: 'lifecycle', value: 'deprecated' }, reason: 'Entity lifecycle is deprecated.' },
    ],
  },
}

export function getSemanticLensRecipe(id: SemanticLensId): SemanticLens {
  return semanticLensRecipes[id]
}
