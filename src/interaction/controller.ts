import { getGroupNodes, getIncidentEdges, getNeighbors } from '../graph/queries.js'
import type { NormalizedGraph } from '../model/types.js'
import { inspectEntity, type EntityRef, type Inspection } from './inspection.js'

export interface SvgInteractionOptions {
  onSelectionChange?: (inspection: Inspection | undefined) => void
  muteUnrelated?: boolean
}

export interface SvgInteractionController {
  readonly selected: EntityRef | undefined
  select(ref: EntityRef): Inspection | undefined
  clear(): void
  destroy(): void
}

interface RelatedEntities {
  nodes: Set<string>
  edges: Set<string>
  groups: Set<string>
}

function emptyRelated(): RelatedEntities {
  return { nodes: new Set(), edges: new Set(), groups: new Set() }
}

function parentGroups(graph: NormalizedGraph, groupId: string | undefined): string[] {
  const result: string[] = []
  let current = groupId
  while (current !== undefined) {
    const currentId = current
    result.push(currentId)
    current = graph.groups?.find((group) => group.id === currentId)?.parent
  }
  return result
}

function relatedEntities(graph: NormalizedGraph, ref: EntityRef): RelatedEntities {
  const related = emptyRelated()

  if (ref.kind === 'node') {
    related.nodes.add(ref.id)
    for (const neighbor of getNeighbors(graph, ref.id)) related.nodes.add(neighbor.id)
    for (const edge of getIncidentEdges(graph, ref.id)) {
      if (edge.id !== undefined) related.edges.add(edge.id)
    }
  } else if (ref.kind === 'edge') {
    const edge = graph.edges.find((candidate) => candidate.id === ref.id)
    if (edge !== undefined) {
      related.edges.add(edge.id)
      related.nodes.add(edge.from)
      related.nodes.add(edge.to)
    }
  } else {
    related.groups.add(ref.id)
    for (const node of getGroupNodes(graph, ref.id)) related.nodes.add(node.id)
    for (const edge of graph.edges) {
      if (related.nodes.has(edge.from) || related.nodes.has(edge.to)) {
        related.edges.add(edge.id)
        related.nodes.add(edge.from)
        related.nodes.add(edge.to)
      }
    }
  }

  for (const node of graph.nodes) {
    if (!related.nodes.has(node.id)) continue
    for (const groupId of parentGroups(graph, node.group)) related.groups.add(groupId)
  }
  return related
}

function elementRef(element: Element | null): EntityRef | undefined {
  if (element === null) return undefined
  const nodeId = element.getAttribute('data-node-id')
  if (nodeId !== null) return { kind: 'node', id: nodeId }
  const edgeId = element.getAttribute('data-edge-id')
  if (edgeId !== null) return { kind: 'edge', id: edgeId }
  const groupId = element.getAttribute('data-group-id')
  if (groupId !== null) return { kind: 'group', id: groupId }
  return undefined
}

function closestEntity(target: EventTarget | null): Element | null {
  if (target === null || typeof (target as Element).closest !== 'function') return null
  return (target as Element).closest('[data-node-id],[data-edge-id],[data-group-id]')
}

function setEntityState(
  svg: SVGSVGElement,
  selected: EntityRef,
  related: RelatedEntities,
  muteUnrelated: boolean,
): void {
  svg.classList.add('ow-has-selection')
  const entries: Array<[string, EntityRef['kind'], Set<string>]> = [
    ['[data-node-id]', 'node', related.nodes],
    ['[data-edge-id]', 'edge', related.edges],
    ['[data-group-id]', 'group', related.groups],
  ]

  for (const [selector, kind, relatedIds] of entries) {
    for (const element of svg.querySelectorAll<SVGElement>(selector)) {
      const id = element.getAttribute(`data-${kind}-id`) ?? ''
      const isSelected = selected.kind === kind && selected.id === id
      const isRelated = relatedIds.has(id)
      element.toggleAttribute('data-selected', isSelected)
      element.toggleAttribute('data-related', !isSelected && isRelated)
      element.toggleAttribute('data-muted', muteUnrelated && !isSelected && !isRelated)
    }
  }
}

function clearEntityState(svg: SVGSVGElement): void {
  svg.classList.remove('ow-has-selection')
  for (const element of svg.querySelectorAll<SVGElement>('[data-selected],[data-related],[data-muted]')) {
    element.removeAttribute('data-selected')
    element.removeAttribute('data-related')
    element.removeAttribute('data-muted')
  }
}

export function mountSvgInteraction(
  svg: SVGSVGElement,
  graph: NormalizedGraph,
  options: SvgInteractionOptions = {},
): SvgInteractionController {
  let selected: EntityRef | undefined
  const muteUnrelated = options.muteUnrelated ?? true

  const controller: SvgInteractionController = {
    get selected() {
      return selected
    },
    select(ref) {
      const inspection = inspectEntity(graph, ref)
      if (inspection === undefined) return undefined
      selected = { ...ref }
      setEntityState(svg, selected, relatedEntities(graph, selected), muteUnrelated)
      options.onSelectionChange?.(inspection)
      return inspection
    },
    clear() {
      if (selected === undefined && !svg.classList.contains('ow-has-selection')) return
      selected = undefined
      clearEntityState(svg)
      options.onSelectionChange?.(undefined)
    },
    destroy() {
      svg.removeEventListener('click', onClick)
      svg.removeEventListener('keydown', onKeyDown)
      controller.clear()
    },
  }

  const onClick = (event: MouseEvent): void => {
    const entity = closestEntity(event.target)
    if (entity === null || !svg.contains(entity)) {
      controller.clear()
      return
    }
    const ref = elementRef(entity)
    if (ref !== undefined) controller.select(ref)
  }

  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      controller.clear()
      return
    }
    if (event.key !== 'Enter' && event.key !== ' ') return
    const entity = closestEntity(event.target)
    if (entity === null || !svg.contains(entity)) return
    const ref = elementRef(entity)
    if (ref === undefined) return
    event.preventDefault()
    controller.select(ref)
  }

  svg.addEventListener('click', onClick)
  svg.addEventListener('keydown', onKeyDown)
  return controller
}
