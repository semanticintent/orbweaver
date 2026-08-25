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
  const usedEdgeIds = new Set(
    graph.edges.flatMap((edge) => edge.id === undefined ? [] : [edge.id]),
  )
  const edges: NormalizedEdge[] = graph.edges.map((edge, index) => {
    let id = edge.id
    if (id === undefined) {
      const base = generatedEdgeId(graph, index)
      id = base
      let collision = 1
      while (usedEdgeIds.has(id)) {
        id = `${base}:${collision}`
        collision += 1
      }
      usedEdgeIds.add(id)
    }
    return {
      ...edge,
      id,
      direction: edge.direction ?? direction,
    }
  })

  return {
    ...graph,
    edges,
    options: {
      ...graph.options,
      directed: graph.options?.directed ?? true,
    },
  }
}
