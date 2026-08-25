import type { Graph } from './types.js'

/** Clone graph input so Orbweaver never retains caller-owned mutable arrays. */
export function cloneGraph(graph: Graph): Graph {
  return structuredClone(graph)
}
