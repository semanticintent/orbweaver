import { cloneGraph } from './clone.js'
import type { Graph } from './types.js'

/** Create an independent plain-data graph value without adding geometry. */
export function createGraph(input: Graph): Graph {
  return cloneGraph(input)
}
