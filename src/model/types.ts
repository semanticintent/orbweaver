export type Metadata = Record<string, unknown>

export interface Provenance {
  uri?: string
  file?: string
  line?: number
  column?: number
  endLine?: number
  endColumn?: number
  path?: string
  recordId?: string
  artifactId?: string
  metadata?: Metadata
}

export type EdgeDirection = 'forward' | 'backward' | 'both' | 'none'
export type LayoutDirection = 'LR' | 'RL' | 'TB' | 'BT'

export interface LayoutPreference {
  engine?: string
  direction?: LayoutDirection
}

export interface GraphOptions {
  directed?: boolean
  layout?: LayoutPreference
}

export interface Node {
  id: string
  type?: string
  label: string
  description?: string
  group?: string
  layer?: string
  status?: string
  value?: string | number
  metadata?: Metadata
  source?: Provenance
}

export interface Edge {
  id?: string
  from: string
  to: string
  type?: string
  label?: string
  direction?: EdgeDirection
  metadata?: Metadata
  source?: Provenance
}

export interface Group {
  id: string
  label: string
  description?: string
  parent?: string
  type?: string
  metadata?: Metadata
  source?: Provenance
}

export interface AnnotationTarget {
  kind: 'graph' | 'node' | 'edge' | 'group'
  id?: string
}

export type AnnotationKind =
  | 'note'
  | 'constraint'
  | 'risk'
  | 'decision'
  | 'evidence'
  | 'assumption'
  | 'change'

export type AnnotationSeverity = 'info' | 'warning' | 'critical'

export interface Annotation {
  id: string
  target?: AnnotationTarget
  label?: string
  body: string
  type?: string
  severity?: AnnotationSeverity
  metadata?: Metadata
  source?: Provenance
}

export interface Graph {
  id: string
  title?: string
  description?: string
  nodes: Node[]
  edges: Edge[]
  groups?: Group[]
  annotations?: Annotation[]
  metadata?: Metadata
  options?: GraphOptions
}

export interface NormalizedEdge extends Edge {
  id: string
  direction: EdgeDirection
}

export interface NormalizedGraph extends Omit<Graph, 'edges' | 'options'> {
  edges: NormalizedEdge[]
  options: Required<Pick<GraphOptions, 'directed'>> & GraphOptions
}
