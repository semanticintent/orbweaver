import { performance } from 'node:perf_hooks'
import { layoutGraph, renderSvg } from '../dist/index.js'

const budgets = {
  small: 150,
  medium: 750,
  large: 2_500,
}

function createGraph(id, nodeCount, extraEdgeCount, groupCount = 0) {
  const groups = Array.from({ length: groupCount }, (_, index) => ({
    id: `group-${index + 1}`,
    label: `Capability domain ${index + 1}`,
  }))
  const nodes = Array.from({ length: nodeCount }, (_, index) => ({
    id: `node-${index + 1}`,
    type: index % 7 === 6 ? 'database' : index % 5 === 4 ? 'decision' : 'service',
    label: `Semantic capability ${index + 1}`,
    ...(groupCount === 0 ? {} : { group: `group-${(index % groupCount) + 1}` }),
  }))
  const edges = Array.from({ length: Math.max(0, nodeCount - 1) }, (_, index) => ({
    id: `sequence-${index + 1}`,
    from: `node-${index + 1}`,
    to: `node-${index + 2}`,
    type: index % 4 === 3 ? 'event' : 'dependency',
  }))
  for (let index = 0; index < extraEdgeCount; index += 1) {
    const from = index % Math.max(1, nodeCount - 5)
    const distance = 2 + (index % 4)
    edges.push({
      id: `cross-${index + 1}`,
      from: `node-${from + 1}`,
      to: `node-${Math.min(nodeCount, from + distance + 1)}`,
      type: 'flow',
    })
  }
  return { id, title: `${id} performance fixture`, groups, nodes, edges }
}

const cases = [
  { id: 'small', graph: createGraph('small', 4, 0), iterations: 9 },
  { id: 'medium', graph: createGraph('medium', 25, 12, 3), iterations: 7 },
  { id: 'large', graph: createGraph('large', 75, 46, 6), iterations: 5 },
]

function median(values) {
  const sorted = [...values].sort((left, right) => left - right)
  return sorted[Math.floor(sorted.length / 2)] ?? Number.NaN
}

let failed = false
for (const benchmark of cases) {
  await layoutGraph(benchmark.graph)
  const observations = []
  for (let index = 0; index < benchmark.iterations; index += 1) {
    const started = performance.now()
    const scene = await layoutGraph(benchmark.graph)
    renderSvg(scene)
    observations.push(performance.now() - started)
  }
  const duration = median(observations)
  const budget = budgets[benchmark.id]
  const status = duration <= budget ? 'PASS' : 'FAIL'
  console.log(`${status} ${benchmark.id.padEnd(6)} ${duration.toFixed(1).padStart(7)} ms median / ${String(budget).padStart(4)} ms budget (${benchmark.graph.nodes.length} nodes, ${benchmark.graph.edges.length} edges)`)
  if (duration > budget) failed = true
}

if (failed) throw new Error('One or more Orbweaver performance budgets were exceeded.')

