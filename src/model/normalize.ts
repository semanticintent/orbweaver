import { GraphValidationError } from '../errors.js'
import { validateGraph } from '../validation/validate.js'
import { cloneGraph } from './clone.js'
import type { EdgeDirection, Graph, NormalizedEdge, NormalizedGraph } from './types.js'

function generatedEdgeId(graph: Graph, index: number): string {
  const edge = graph.edges[index]
  if (edge === undefined) throw new RangeError(`No edge exists at index ${index}.`)
  return `edge:${edge.from}->${edge.to}:${edge.type ?? 'generic'}:${index}`
}

function defaultDirection(graph: Graph): EdgeDirection {
  return graph.options?.directed === false ? 'none' : 'forward'
}

export function normalizeGraph(input: Graph): NormalizedGraph {
  const validation = validateGraph(input)
  if (!validation.valid) throw new GraphValidationError(validation.errors)

  const graph = cloneGraph(input)
  const direction = defaultDirection(graph)
  const edges: NormalizedEdge[] = graph.edges.map((edge, index) => ({
    ...edge,
    id: edge.id ?? generatedEdgeId(graph, index),
    direction: edge.direction ?? direction,
  }))

  return {
    ...graph,
    edges,
    options: {
      ...graph.options,
      directed: graph.options?.directed ?? true,
    },
  }
}
