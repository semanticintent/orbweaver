import type { Graph, LayoutDirection, NormalizedGraph } from '../model/types.js'
import type { Scene } from '../scene/types.js'

export interface LayoutOptions {
  direction?: LayoutDirection
  spacing?: number
  layerSpacing?: number
  padding?: number
}

export interface LayoutEngine {
  readonly id: string
  layout(graph: NormalizedGraph, options?: LayoutOptions): Promise<Scene>
}

export interface LayoutGraphOptions extends LayoutOptions {
  engine?: LayoutEngine
}

export type LayoutGraphInput = Graph | NormalizedGraph
