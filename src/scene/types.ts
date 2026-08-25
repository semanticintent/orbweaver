import type { NormalizedGraph } from '../model/types.js'

export interface Point {
  x: number
  y: number
}

export interface SceneNode {
  nodeId: string
  x: number
  y: number
  width: number
  height: number
}

export interface SceneEdge {
  edgeId: string
  points: Point[]
}

export interface SceneGroup {
  groupId: string
  x: number
  y: number
  width: number
  height: number
}

export interface Scene {
  width: number
  height: number
  nodes: SceneNode[]
  edges: SceneEdge[]
  groups: SceneGroup[]
  graph: NormalizedGraph
}
