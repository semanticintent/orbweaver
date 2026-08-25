import type { Graph } from '../model/types.js'

function relationship(edge: Graph['edges'][number], labels: ReadonlyMap<string, string>): string {
  const from = labels.get(edge.from) ?? edge.from
  const to = labels.get(edge.to) ?? edge.to
  const relation = edge.type === undefined ? 'connects to' : edge.type.replaceAll('-', ' ')
  return `${from} ${relation} ${to}${edge.label === undefined ? '' : ` (${edge.label})`}.`
}

export function summarizeGraph(graph: Graph): string {
  const heading = graph.title ?? graph.id
  const labels = new Map(graph.nodes.map((node) => [node.id, node.label]))
  const count = `${graph.nodes.length} ${graph.nodes.length === 1 ? 'node' : 'nodes'} and ${graph.edges.length} ${graph.edges.length === 1 ? 'relationship' : 'relationships'}.`
  const relationships = graph.edges.map((edge) => relationship(edge, labels)).join(' ')
  return [heading, graph.description, count, relationships].filter((part) => part !== undefined && part !== '').join('. ').replaceAll('..', '.')
}
