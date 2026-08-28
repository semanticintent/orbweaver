import {
  getGroupNodes,
  getAnnotations,
  getIncomingEdges,
  getNeighbors,
  getOutgoingEdges,
} from '../graph/queries.js'
import type { Annotation, Metadata, NormalizedGraph, Provenance } from '../model/types.js'

export type InspectableEntityKind = 'node' | 'edge' | 'group'

export interface EntityRef {
  kind: InspectableEntityKind
  id: string
}

export interface InspectionRelationships {
  incomingEdgeIds: string[]
  outgoingEdgeIds: string[]
  neighborNodeIds: string[]
}

export interface Inspection {
  kind: InspectableEntityKind
  id: string
  label?: string
  description?: string
  type?: string
  status?: string
  metadata?: Metadata
  source?: Provenance
  relationships?: InspectionRelationships
  memberNodeIds?: string[]
  from?: string
  to?: string
  annotations?: Annotation[]
}

export function inspectEntity(graph: NormalizedGraph, ref: EntityRef): Inspection | undefined {
  if (ref.kind === 'node') {
    const node = graph.nodes.find((candidate) => candidate.id === ref.id)
    if (node === undefined) return undefined
    const annotations = getAnnotations(graph, ref)
    return {
      kind: 'node',
      id: node.id,
      label: node.label,
      ...(node.description === undefined ? {} : { description: node.description }),
      ...(node.type === undefined ? {} : { type: node.type }),
      ...(node.status === undefined ? {} : { status: node.status }),
      ...(node.metadata === undefined ? {} : { metadata: node.metadata }),
      ...(node.source === undefined ? {} : { source: node.source }),
      ...(annotations.length === 0 ? {} : { annotations }),
      relationships: {
        incomingEdgeIds: getIncomingEdges(graph, node.id).flatMap((edge) => edge.id === undefined ? [] : [edge.id]),
        outgoingEdgeIds: getOutgoingEdges(graph, node.id).flatMap((edge) => edge.id === undefined ? [] : [edge.id]),
        neighborNodeIds: getNeighbors(graph, node.id).map((neighbor) => neighbor.id),
      },
    }
  }

  if (ref.kind === 'edge') {
    const edge = graph.edges.find((candidate) => candidate.id === ref.id)
    if (edge === undefined) return undefined
    const annotations = getAnnotations(graph, ref)
    return {
      kind: 'edge',
      id: edge.id,
      ...(edge.label === undefined ? {} : { label: edge.label }),
      ...(edge.type === undefined ? {} : { type: edge.type }),
      ...(edge.metadata === undefined ? {} : { metadata: edge.metadata }),
      ...(edge.source === undefined ? {} : { source: edge.source }),
      ...(annotations.length === 0 ? {} : { annotations }),
      from: edge.from,
      to: edge.to,
    }
  }

  const group = graph.groups?.find((candidate) => candidate.id === ref.id)
  if (group === undefined) return undefined
  const annotations = getAnnotations(graph, ref)
  return {
    kind: 'group',
    id: group.id,
    label: group.label,
    ...(group.description === undefined ? {} : { description: group.description }),
    ...(group.type === undefined ? {} : { type: group.type }),
    ...(group.metadata === undefined ? {} : { metadata: group.metadata }),
    ...(group.source === undefined ? {} : { source: group.source }),
    ...(annotations.length === 0 ? {} : { annotations }),
    memberNodeIds: getGroupNodes(graph, group.id).map((node) => node.id),
  }
}
