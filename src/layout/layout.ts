import type { Graph } from '../model/types.js'
import { normalizeGraph } from '../model/normalize.js'
import type { Scene } from '../scene/types.js'
import { ElkLayoutEngine } from './elk.js'
import type { LayoutGraphOptions } from './types.js'

export async function layoutGraph(graph: Graph, options: LayoutGraphOptions = {}): Promise<Scene> {
  const normalized = normalizeGraph(graph)
  const engine = options.engine ?? new ElkLayoutEngine()
  const { engine: _engine, ...layoutOptions } = options
  return engine.layout(normalized, layoutOptions)
}
