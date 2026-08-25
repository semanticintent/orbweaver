import ELKModule, {
  type ELK as ElkApi,
  type ELKConstructorArguments,
  type ElkEdgeSection,
  type ElkExtendedEdge,
  type ElkNode,
  type ElkPoint,
} from 'elkjs/lib/elk.bundled.js'
import { LayoutError } from '../errors.js'
import type { Group, LayoutDirection, Node, NormalizedGraph } from '../model/types.js'
import type { Point, Scene, SceneEdge, SceneEdgeLabel, SceneGroup, SceneNode } from '../scene/types.js'
import { estimateNodeSize } from './sizing.js'
import type { LayoutEngine, LayoutOptions } from './types.js'

const DEFAULT_SPACING = 40
const DEFAULT_LAYER_SPACING = 80
const DEFAULT_PADDING = 24

// elkjs publishes CommonJS-shaped declarations; normalize that private import
// without exposing its constructor type through Orbweaver's public API.
const ELK = ELKModule as unknown as new (options?: ELKConstructorArguments) => ElkApi

function elkDirection(direction: LayoutDirection): string {
  switch (direction) {
    case 'LR': return 'RIGHT'
    case 'RL': return 'LEFT'
    case 'TB': return 'DOWN'
    case 'BT': return 'UP'
  }
}

function groupNode(group: Group, children: ElkNode[]): ElkNode {
  return {
    id: group.id,
    labels: [{ text: group.label, width: Math.max(80, group.label.length * 8), height: 20 }],
    children,
    layoutOptions: {
      'elk.padding': '[top=44,left=24,bottom=24,right=24]',
    },
  }
}

function leafNode(node: Node): ElkNode {
  const size = estimateNodeSize(node)
  return { id: node.id, width: size.width, height: size.height }
}

function buildChildren(graph: NormalizedGraph): ElkNode[] {
  const groups = graph.groups ?? []
  const nodesByGroup = new Map<string, Node[]>()
  const childGroups = new Map<string, Group[]>()

  for (const node of graph.nodes) {
    if (node.group === undefined) continue
    const members = nodesByGroup.get(node.group) ?? []
    members.push(node)
    nodesByGroup.set(node.group, members)
  }
  for (const group of groups) {
    if (group.parent === undefined) continue
    const children = childGroups.get(group.parent) ?? []
    children.push(group)
    childGroups.set(group.parent, children)
  }

  const createGroup = (group: Group): ElkNode => {
    const nestedGroups = (childGroups.get(group.id) ?? []).map(createGroup)
    const nodes = (nodesByGroup.get(group.id) ?? []).map(leafNode)
    return groupNode(group, [...nestedGroups, ...nodes])
  }

  return [
    ...groups.filter((group) => group.parent === undefined).map(createGroup),
    ...graph.nodes.filter((node) => node.group === undefined).map(leafNode),
  ]
}

function toElkGraph(graph: NormalizedGraph, options: LayoutOptions): ElkNode {
  const direction = options.direction ?? graph.options.layout?.direction ?? 'LR'
  const spacing = options.spacing ?? DEFAULT_SPACING
  const layerSpacing = options.layerSpacing ?? DEFAULT_LAYER_SPACING
  const padding = options.padding ?? DEFAULT_PADDING

  const edges: ElkExtendedEdge[] = graph.edges.map((edge) => {
    const label = edge.label?.trim()
    return {
      id: edge.id,
      sources: [edge.from],
      targets: [edge.to],
      ...(label === undefined || label === '' ? {} : {
        labels: [{ text: label, width: Math.max(32, label.length * 7 + 16), height: 22 }],
      }),
    }
  })

  return {
    id: graph.id,
    children: buildChildren(graph),
    edges,
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': elkDirection(direction),
      'elk.edgeRouting': 'ORTHOGONAL',
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
      'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
      'elk.layered.crossingMinimization.forceNodeModelOrder': 'true',
      'elk.spacing.nodeNode': String(spacing),
      'elk.layered.spacing.nodeNodeBetweenLayers': String(layerSpacing),
      'elk.padding': `[top=${padding},left=${padding},bottom=${padding},right=${padding}]`,
    },
  }
}

function requiredNumber(value: number | undefined, description: string): number {
  if (value === undefined || !Number.isFinite(value)) {
    throw new LayoutError(`ELK returned invalid ${description}.`)
  }
  return value
}

function translatePoint(point: ElkPoint, offsetX: number, offsetY: number): Point {
  return { x: point.x + offsetX, y: point.y + offsetY }
}

function sectionPoints(section: ElkEdgeSection, offsetX = 0, offsetY = 0): Point[] {
  return [
    translatePoint(section.startPoint, offsetX, offsetY),
    ...(section.bendPoints ?? []).map((point) => translatePoint(point, offsetX, offsetY)),
    translatePoint(section.endPoint, offsetX, offsetY),
  ]
}

function flattenShapes(
  root: ElkNode,
  groupIds: ReadonlySet<string>,
): { nodes: SceneNode[]; groups: SceneGroup[] } {
  const nodes: SceneNode[] = []
  const groups: SceneGroup[] = []

  const visit = (shape: ElkNode, parentX: number, parentY: number): void => {
    const x = parentX + requiredNumber(shape.x, `x coordinate for "${shape.id}"`)
    const y = parentY + requiredNumber(shape.y, `y coordinate for "${shape.id}"`)
    const width = requiredNumber(shape.width, `width for "${shape.id}"`)
    const height = requiredNumber(shape.height, `height for "${shape.id}"`)

    if (groupIds.has(shape.id)) {
      groups.push({ groupId: shape.id, x, y, width, height })
    } else {
      nodes.push({ nodeId: shape.id, x, y, width, height })
    }

    for (const child of shape.children ?? []) visit(child, x, y)
  }

  for (const child of root.children ?? []) visit(child, 0, 0)
  return { nodes, groups }
}

function flattenEdges(root: ElkNode): SceneEdge[] {
  const result: SceneEdge[] = []
  const offsets = new Map<string, Point>([[root.id, { x: 0, y: 0 }]])

  const collectOffsets = (container: ElkNode, parentX: number, parentY: number): void => {
    const x = parentX + (container.x ?? 0)
    const y = parentY + (container.y ?? 0)
    offsets.set(container.id, { x, y })
    for (const child of container.children ?? []) collectOffsets(child, x, y)
  }
  for (const child of root.children ?? []) collectOffsets(child, 0, 0)

  const visit = (container: ElkNode, parentX: number, parentY: number): void => {
    const containerX = parentX + (container.x ?? 0)
    const containerY = parentY + (container.y ?? 0)
    for (const edge of container.edges ?? []) {
      const declaredContainer = edge.container === undefined ? undefined : offsets.get(edge.container)
      const offsetX = declaredContainer?.x ?? containerX
      const offsetY = declaredContainer?.y ?? containerY
      const points = (edge.sections ?? []).flatMap((section) => sectionPoints(section, offsetX, offsetY))
      if (points.length < 2) throw new LayoutError(`ELK returned no route for edge "${edge.id}".`)
      const elkLabel = edge.labels?.[0]
      let label: SceneEdgeLabel | undefined
      if (
        elkLabel?.x !== undefined && elkLabel.y !== undefined
        && elkLabel.width !== undefined && elkLabel.height !== undefined
      ) {
        label = {
          x: elkLabel.x + offsetX,
          y: elkLabel.y + offsetY,
          width: elkLabel.width,
          height: elkLabel.height,
        }
      }
      result.push({ edgeId: edge.id, points, ...(label === undefined ? {} : { label }) })
    }
    for (const child of container.children ?? []) visit(child, containerX, containerY)
  }

  visit(root, 0, 0)
  return result
}

export class ElkLayoutEngine implements LayoutEngine {
  readonly id = 'elk-layered'

  async layout(graph: NormalizedGraph, options: LayoutOptions = {}): Promise<Scene> {
    try {
      const elk = new ELK()
      const result = await elk.layout(toElkGraph(graph, options))
      const shapes = flattenShapes(result, new Set((graph.groups ?? []).map((group) => group.id)))
      const edges = flattenEdges(result)

      return {
        width: requiredNumber(result.width, 'scene width'),
        height: requiredNumber(result.height, 'scene height'),
        nodes: shapes.nodes,
        groups: shapes.groups,
        edges,
        graph,
      }
    } catch (error) {
      if (error instanceof LayoutError) throw error
      throw new LayoutError(`ELK layout failed for graph "${graph.id}".`, { cause: error })
    }
  }
}
