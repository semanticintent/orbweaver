import type { Annotation, Group, Node, NormalizedEdge, NormalizedGraph } from '../model/types.js'
import type { EntityRef, InspectableEntityKind } from '../interaction/inspection.js'

export type ArchitectureChangeState = 'unchanged' | 'introduced' | 'removed' | 'changed'
export type ArchitectureEntity = Node | NormalizedEdge | Group

export interface ArchitectureFieldChange {
  field: string
  before?: unknown
  after?: unknown
}

export interface ArchitectureComparisonEntry {
  entity: EntityRef
  state: ArchitectureChangeState
  before?: ArchitectureEntity
  after?: ArchitectureEntity
  beforeAnnotations?: Annotation[]
  afterAnnotations?: Annotation[]
  changes: ArchitectureFieldChange[]
}

export interface ArchitectureComparisonCounts {
  unchanged: number
  introduced: number
  removed: number
  changed: number
}

export interface ArchitectureComparison {
  baseGraphId: string
  targetGraphId: string
  entries: ArchitectureComparisonEntry[]
  counts: ArchitectureComparisonCounts
  summary: string
}

const nodeFields = ['label', 'description', 'type', 'group', 'layer', 'status', 'value', 'metadata', 'source'] as const
const edgeFields = ['from', 'to', 'label', 'type', 'direction', 'metadata', 'source'] as const
const groupFields = ['label', 'description', 'parent', 'type', 'metadata', 'source'] as const

function canonical(value: unknown): string {
  if (value === undefined) return 'undefined'
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`
  return `{${Object.entries(value).sort(([left], [right]) => left.localeCompare(right)).map(([key, entry]) => `${JSON.stringify(key)}:${canonical(entry)}`).join(',')}}`
}

function annotationsFor(graph: NormalizedGraph, ref: EntityRef): Annotation[] {
  return (graph.annotations ?? []).filter((annotation) => annotation.target?.kind === ref.kind && annotation.target.id === ref.id)
}

function fields(kind: InspectableEntityKind): readonly string[] {
  if (kind === 'node') return nodeFields
  if (kind === 'edge') return edgeFields
  return groupFields
}

function changesFor(
  kind: InspectableEntityKind,
  before: ArchitectureEntity,
  after: ArchitectureEntity,
  beforeAnnotations: readonly Annotation[],
  afterAnnotations: readonly Annotation[],
): ArchitectureFieldChange[] {
  const result = fields(kind).flatMap((field): ArchitectureFieldChange[] => {
    const beforeValue = (before as unknown as Record<string, unknown>)[field]
    const afterValue = (after as unknown as Record<string, unknown>)[field]
    if (canonical(beforeValue) === canonical(afterValue)) return []
    return [{ field, ...(beforeValue === undefined ? {} : { before: structuredClone(beforeValue) }), ...(afterValue === undefined ? {} : { after: structuredClone(afterValue) }) }]
  })
  if (canonical(beforeAnnotations) !== canonical(afterAnnotations)) {
    result.push({ field: 'annotations', before: structuredClone(beforeAnnotations), after: structuredClone(afterAnnotations) })
  }
  return result
}

function entities(graph: NormalizedGraph, kind: InspectableEntityKind): ArchitectureEntity[] {
  if (kind === 'node') return graph.nodes
  if (kind === 'edge') return graph.edges
  return graph.groups ?? []
}

function compareKind(base: NormalizedGraph, target: NormalizedGraph, kind: InspectableEntityKind): ArchitectureComparisonEntry[] {
  const before = entities(base, kind)
  const after = entities(target, kind)
  const beforeById = new Map(before.map((entity) => [entity.id, entity]))
  const afterIds = new Set(after.map((entity) => entity.id))
  const targetEntries = after.map((afterEntity): ArchitectureComparisonEntry => {
    const ref: EntityRef = { kind, id: afterEntity.id }
    const beforeEntity = beforeById.get(afterEntity.id)
    const afterAnnotations = annotationsFor(target, ref)
    if (beforeEntity === undefined) {
      return { entity: ref, state: 'introduced', after: structuredClone(afterEntity), ...(afterAnnotations.length === 0 ? {} : { afterAnnotations: structuredClone(afterAnnotations) }), changes: [] }
    }
    const beforeAnnotations = annotationsFor(base, ref)
    const changes = changesFor(kind, beforeEntity, afterEntity, beforeAnnotations, afterAnnotations)
    return {
      entity: ref,
      state: changes.length === 0 ? 'unchanged' : 'changed',
      before: structuredClone(beforeEntity),
      after: structuredClone(afterEntity),
      ...(beforeAnnotations.length === 0 ? {} : { beforeAnnotations: structuredClone(beforeAnnotations) }),
      ...(afterAnnotations.length === 0 ? {} : { afterAnnotations: structuredClone(afterAnnotations) }),
      changes,
    }
  })
  const removed = before.flatMap((beforeEntity): ArchitectureComparisonEntry[] => {
    if (afterIds.has(beforeEntity.id)) return []
    const ref: EntityRef = { kind, id: beforeEntity.id }
    const beforeAnnotations = annotationsFor(base, ref)
    return [{ entity: ref, state: 'removed', before: structuredClone(beforeEntity), ...(beforeAnnotations.length === 0 ? {} : { beforeAnnotations: structuredClone(beforeAnnotations) }), changes: [] }]
  })
  return [...targetEntries, ...removed]
}

export function compareArchitectures(base: NormalizedGraph, target: NormalizedGraph): ArchitectureComparison {
  const entries = (['node', 'edge', 'group'] as const).flatMap((kind) => compareKind(base, target, kind))
  const counts: ArchitectureComparisonCounts = {
    unchanged: entries.filter((entry) => entry.state === 'unchanged').length,
    introduced: entries.filter((entry) => entry.state === 'introduced').length,
    removed: entries.filter((entry) => entry.state === 'removed').length,
    changed: entries.filter((entry) => entry.state === 'changed').length,
  }
  const removedLabels = entries
    .filter((entry) => entry.state === 'removed')
    .map((entry) => {
      const entity = entry.before
      return entity && 'label' in entity && entity.label ? entity.label : entry.entity.id
    })
  const removedSummary = removedLabels.length === 0 ? '' : ` Removed: ${removedLabels.join(', ')}.`
  const summary = `Architecture comparison from ${base.title ?? base.id} to ${target.title ?? target.id}: ${counts.unchanged} unchanged, ${counts.introduced} introduced, ${counts.removed} removed, and ${counts.changed} changed.${removedSummary}`
  return { baseGraphId: base.id, targetGraphId: target.id, entries, counts, summary }
}

export function getArchitectureComparisonEntry(comparison: ArchitectureComparison, ref: EntityRef): ArchitectureComparisonEntry | undefined {
  return comparison.entries.find((entry) => entry.entity.kind === ref.kind && entry.entity.id === ref.id)
}
