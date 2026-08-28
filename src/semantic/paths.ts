import type { Metadata, NormalizedEdge, NormalizedGraph } from '../model/types.js'
import type { EntityRef } from '../interaction/inspection.js'

export type PathNarrativeId = 'upstream' | 'downstream' | 'data-lineage' | 'failure-propagation' | 'trust-crossings'
export type PathNarrativeDirection = 'upstream' | 'downstream' | 'both'
export type PathNarrativeRole = 'start' | 'step' | 'background'

export interface PathNarrativeMetadataRule {
  key: string
  value?: string | number | boolean | null
}

export interface PathNarrativeEdgeRule {
  edgeTypes?: string[]
  edgeMetadata?: PathNarrativeMetadataRule
  endpointTypes?: string[]
}

export interface PathNarrativeRecipe {
  id: string
  label: string
  direction: PathNarrativeDirection
  rules?: PathNarrativeEdgeRule[]
  reason: string
}

export interface PathNarrativeOptions {
  maxDepth?: number
  maxSteps?: number
}

export interface PathNarrativeStep {
  index: number
  depth: number
  edgeId: string
  from: string
  to: string
  traversal: 'forward' | 'reverse'
  reason: string
}

export interface PathNarrativeDiagnostic {
  code: 'max-depth' | 'max-steps'
  message: string
}

export interface PathNarrativeMatch {
  entity: EntityRef
  role: PathNarrativeRole
  stepIndexes: number[]
}

export interface PathNarrativeProjection {
  narrativeId: string
  label: string
  startNodeId: string
  direction: PathNarrativeDirection
  steps: PathNarrativeStep[]
  matches: PathNarrativeMatch[]
  summary: string
  truncated: boolean
  diagnostics: PathNarrativeDiagnostic[]
}

interface Arc {
  edge: NormalizedEdge
  from: string
  to: string
  traversal: 'forward' | 'reverse'
}

const defaultMaxDepth = 4
const defaultMaxSteps = 50

function metadataMatches(metadata: Metadata | undefined, rule: PathNarrativeMetadataRule | undefined): boolean {
  if (rule === undefined) return true
  if (metadata === undefined || !(rule.key in metadata)) return false
  return rule.value === undefined || metadata[rule.key] === rule.value
}

function edgeMatches(graph: NormalizedGraph, edge: NormalizedEdge, rules: readonly PathNarrativeEdgeRule[] | undefined): boolean {
  if (rules === undefined || rules.length === 0) return true
  const from = graph.nodes.find((node) => node.id === edge.from)
  const to = graph.nodes.find((node) => node.id === edge.to)
  return rules.some((rule) => {
    if (rule.edgeTypes !== undefined && !rule.edgeTypes.includes(edge.type ?? 'generic')) return false
    if (!metadataMatches(edge.metadata, rule.edgeMetadata)) return false
    if (rule.endpointTypes !== undefined && !rule.endpointTypes.some((type) => from?.type === type || to?.type === type)) return false
    return true
  })
}

function edgeArcs(edge: NormalizedEdge): Arc[] {
  const forward: Arc = { edge, from: edge.from, to: edge.to, traversal: 'forward' }
  const reverse: Arc = { edge, from: edge.to, to: edge.from, traversal: 'reverse' }
  if (edge.direction === 'forward') return [forward]
  if (edge.direction === 'backward') return [reverse]
  return [forward, reverse]
}

function candidates(graph: NormalizedGraph, nodeId: string, recipe: PathNarrativeRecipe): Arc[] {
  return graph.edges.flatMap((edge) => {
    if (!edgeMatches(graph, edge, recipe.rules)) return []
    return edgeArcs(edge).filter((arc) => {
      if (recipe.direction === 'downstream') return arc.from === nodeId
      if (recipe.direction === 'upstream') return arc.to === nodeId
      return arc.from === nodeId || arc.to === nodeId
    }).map((arc) => recipe.direction === 'upstream'
      ? { ...arc, from: nodeId, to: arc.from, traversal: arc.traversal === 'forward' ? 'reverse' as const : 'forward' as const }
      : arc.from === nodeId ? arc : { ...arc, from: nodeId, to: arc.from, traversal: arc.traversal === 'forward' ? 'reverse' as const : 'forward' as const })
  })
}

function positiveInteger(value: number | undefined, fallback: number, name: string): number {
  const resolved = value ?? fallback
  if (!Number.isInteger(resolved) || resolved <= 0) throw new RangeError(`${name} must be a positive integer.`)
  return resolved
}

export function derivePathNarrative(
  graph: NormalizedGraph,
  startNodeId: string,
  recipe: PathNarrativeRecipe,
  options: PathNarrativeOptions = {},
): PathNarrativeProjection {
  if (!graph.nodes.some((node) => node.id === startNodeId)) throw new RangeError(`Unknown narrative start node: ${startNodeId}.`)
  const maxDepth = positiveInteger(options.maxDepth, defaultMaxDepth, 'maxDepth')
  const maxSteps = positiveInteger(options.maxSteps, defaultMaxSteps, 'maxSteps')
  const queue: Array<{ nodeId: string; depth: number }> = [{ nodeId: startNodeId, depth: 0 }]
  const visited = new Set([startNodeId])
  const steps: PathNarrativeStep[] = []
  let depthTruncated = false
  let stepTruncated = false

  while (queue.length > 0 && !stepTruncated) {
    const current = queue.shift()!
    const nextArcs = candidates(graph, current.nodeId, recipe)
    if (current.depth >= maxDepth) {
      if (nextArcs.some((arc) => !visited.has(arc.to))) depthTruncated = true
      continue
    }
    for (const arc of nextArcs) {
      if (visited.has(arc.to)) continue
      if (steps.length >= maxSteps) {
        stepTruncated = true
        break
      }
      const step: PathNarrativeStep = {
        index: steps.length,
        depth: current.depth + 1,
        edgeId: arc.edge.id,
        from: current.nodeId,
        to: arc.to,
        traversal: arc.traversal,
        reason: recipe.reason,
      }
      steps.push(step)
      visited.add(arc.to)
      queue.push({ nodeId: arc.to, depth: step.depth })
    }
  }

  const diagnostics: PathNarrativeDiagnostic[] = []
  if (depthTruncated) diagnostics.push({ code: 'max-depth', message: `Narrative stopped at depth ${maxDepth}.` })
  if (stepTruncated) diagnostics.push({ code: 'max-steps', message: `Narrative stopped after ${maxSteps} steps.` })
  const nodeMatches = graph.nodes.map((node): PathNarrativeMatch => ({
    entity: { kind: 'node', id: node.id },
    role: node.id === startNodeId ? 'start' : visited.has(node.id) ? 'step' : 'background',
    stepIndexes: steps.flatMap((step) => step.from === node.id || step.to === node.id ? [step.index] : []),
  }))
  const edgeMatches = graph.edges.map((edge): PathNarrativeMatch => ({
    entity: { kind: 'edge', id: edge.id },
    role: steps.some((step) => step.edgeId === edge.id) ? 'step' : 'background',
    stepIndexes: steps.flatMap((step) => step.edgeId === edge.id ? [step.index] : []),
  }))
  const startLabel = graph.nodes.find((node) => node.id === startNodeId)?.label ?? startNodeId
  const summary = `${recipe.label} from ${startLabel}: ${steps.length} ${steps.length === 1 ? 'step' : 'steps'} across ${visited.size} ${visited.size === 1 ? 'entity' : 'entities'}.${diagnostics.length === 0 ? '' : ` ${diagnostics.map((diagnostic) => diagnostic.message).join(' ')}`}`
  return { narrativeId: recipe.id, label: recipe.label, startNodeId, direction: recipe.direction, steps, matches: [...nodeMatches, ...edgeMatches], summary, truncated: diagnostics.length > 0, diagnostics }
}

export function getPathNarrativeMatch(projection: PathNarrativeProjection, ref: EntityRef): PathNarrativeMatch | undefined {
  return projection.matches.find((match) => match.entity.kind === ref.kind && match.entity.id === ref.id)
}

export const pathNarrativeRecipes: Readonly<Record<PathNarrativeId, PathNarrativeRecipe>> = {
  upstream: { id: 'upstream', label: 'Upstream dependencies', direction: 'upstream', reason: 'Upstream relationship from the selected entity.' },
  downstream: { id: 'downstream', label: 'Downstream impact', direction: 'downstream', reason: 'Downstream relationship from the selected entity.' },
  'data-lineage': { id: 'data-lineage', label: 'Data lineage', direction: 'both', rules: [{ edgeTypes: ['data', 'event'] }], reason: 'Declared data or event relationship.' },
  'failure-propagation': { id: 'failure-propagation', label: 'Failure propagation', direction: 'downstream', rules: [{ edgeTypes: ['error', 'failure'] }], reason: 'Declared failure relationship.' },
  'trust-crossings': { id: 'trust-crossings', label: 'Trust-boundary crossings', direction: 'both', rules: [{ edgeMetadata: { key: 'trustBoundary', value: true } }, { endpointTypes: ['external'] }], reason: 'Declared trust boundary or external endpoint.' },
}

export function getPathNarrativeRecipe(id: PathNarrativeId): PathNarrativeRecipe {
  return structuredClone(pathNarrativeRecipes[id])
}
