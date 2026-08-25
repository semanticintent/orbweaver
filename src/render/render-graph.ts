import { layoutGraph } from '../layout/layout.js'
import type { Graph } from '../model/types.js'
import { renderSvg } from './svg.js'
import type { RenderGraphOptions } from './types.js'

export async function renderGraph(graph: Graph, options: RenderGraphOptions = {}): Promise<string> {
  const scene = await layoutGraph(graph, options.layout)
  return renderSvg(scene, options.render)
}
