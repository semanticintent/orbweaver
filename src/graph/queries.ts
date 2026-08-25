import type { Edge, Graph, Group, Node } from '../model/types.js'

export function getIncomingEdges(graph: Graph, nodeId: string): Edge[] {
  return graph.edges.filter((edge) => edge.to === nodeId)
}

export function getOutgoingEdges(graph: Graph, nodeId: string): Edge[] {
  return graph.edges.filter((edge) => edge.from === nodeId)
}

export function getIncidentEdges(graph: Graph, nodeId: string): Edge[] {
  return graph.edges.filter((edge) => edge.from === nodeId || edge.to === nodeId)
}

export function getNeighbors(graph: Graph, nodeId: string): Node[] {
  const ids = new Set<string>()
  for (const edge of getIncidentEdges(graph, nodeId)) {
    if (edge.from !== nodeId) ids.add(edge.from)
    if (edge.to !== nodeId) ids.add(edge.to)
  }
  return graph.nodes.filter((node) => ids.has(node.id))
}

function descendantGroupIds(groups: readonly Group[], groupId: string): Set<string> {
  const result = new Set([groupId])
  let changed = true
  while (changed) {
    changed = false
    for (const group of groups) {
      if (group.parent !== undefined && result.has(group.parent) && !result.has(group.id)) {
        result.add(group.id)
        changed = true
      }
    }
  }
  return result
}

export function getGroupNodes(graph: Graph, groupId: string, recursive = true): Node[] {
  const ids = recursive ? descendantGroupIds(graph.groups ?? [], groupId) : new Set([groupId])
  return graph.nodes.filter((node) => node.group !== undefined && ids.has(node.group))
}
