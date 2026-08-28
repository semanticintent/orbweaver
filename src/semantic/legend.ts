import type { NormalizedGraph } from '../model/types.js'
import type { SemanticDetailLevel } from './detail.js'
import type { LensProjection } from './lenses.js'
import type { PathNarrativeProjection } from './paths.js'

export type LegendSectionId = 'entities' | 'groups' | 'relationships' | 'statuses' | 'annotations' | 'view'

export interface LegendItem {
  id: string
  label: string
  count: number
}

export interface LegendSection {
  id: LegendSectionId
  label: string
  items: LegendItem[]
}

export interface LegendContext {
  lens?: LensProjection
  detailLevel?: SemanticDetailLevel
  narrative?: PathNarrativeProjection
}

export interface LegendModel {
  sections: LegendSection[]
  itemCount: number
  summary: string
}

function humanize(value: string): string {
  const words = value.replace(/[-_]+/g, ' ').trim()
  return words === '' ? 'Generic' : `${words.charAt(0).toUpperCase()}${words.slice(1)}`
}

function counted(values: readonly string[]): LegendItem[] {
  const counts = new Map<string, number>()
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
  return [...counts].map(([id, count]) => ({ id, label: humanize(id), count }))
}

function section(id: LegendSectionId, label: string, values: readonly string[]): LegendSection | undefined {
  const items = counted(values)
  return items.length === 0 ? undefined : { id, label, items }
}

export function deriveLegend(graph: NormalizedGraph, context: LegendContext = {}): LegendModel {
  const sections = [
    section('entities', 'Entities', graph.nodes.map((node) => node.type ?? 'generic')),
    section('groups', 'Groups', (graph.groups ?? []).map((group) => group.type ?? 'group')),
    section('relationships', 'Relationships', graph.edges.map((edge) => edge.type ?? 'generic')),
    section('statuses', 'Statuses', graph.nodes.flatMap((node) => node.status === undefined || node.status === 'default' ? [] : [node.status])),
    section('annotations', 'Annotations', (graph.annotations ?? []).map((annotation) => annotation.type ?? 'note')),
    section('view', 'Active view', [
      ...(context.lens === undefined ? [] : [`${context.lens.label} lens`]),
      ...(context.detailLevel === undefined ? [] : [`${context.detailLevel} detail`]),
      ...(context.narrative === undefined ? [] : [context.narrative.label]),
    ]),
  ].filter((value): value is LegendSection => value !== undefined)
  const itemCount = sections.reduce((total, current) => total + current.items.length, 0)
  const summary = `Generated legend with ${itemCount} ${itemCount === 1 ? 'item' : 'items'} across ${sections.length} ${sections.length === 1 ? 'section' : 'sections'}: ${sections.map((current) => `${current.label}, ${current.items.map((item) => `${item.label} (${item.count})`).join(', ')}`).join('; ')}.`
  return { sections, itemCount, summary }
}
