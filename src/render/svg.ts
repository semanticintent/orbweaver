import { summarizeGraph } from '../accessibility/summarize.js'
import type { Edge, Node, NormalizedGraph } from '../model/types.js'
import type { Point, Scene, SceneEdge, SceneNode } from '../scene/types.js'
import { lightTheme } from '../theme/defaults.js'
import type { OrbweaverTheme } from '../theme/types.js'
import type { Renderer, SvgRenderOptions } from './types.js'

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function safeToken(value: string): string {
  const token = value.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '')
  return token === '' ? 'entity' : token
}

function cssVariables(theme: OrbweaverTheme): string {
  const { colors, typography, geometry } = theme
  return [
    `--ow-canvas:${colors.canvas}`,
    `--ow-surface:${colors.surface}`,
    `--ow-surface-raised:${colors.surfaceRaised}`,
    `--ow-surface-muted:${colors.surfaceMuted}`,
    `--ow-text:${colors.text}`,
    `--ow-text-muted:${colors.textMuted}`,
    `--ow-border:${colors.border}`,
    `--ow-border-strong:${colors.borderStrong}`,
    `--ow-edge:${colors.edge}`,
    `--ow-edge-label:${colors.edgeLabel}`,
    `--ow-accent:${colors.accent}`,
    `--ow-accent-soft:${colors.accentSoft}`,
    `--ow-focus:${colors.focus}`,
    `--ow-selection:${colors.selection}`,
    `--ow-success:${colors.success}`,
    `--ow-warning:${colors.warning}`,
    `--ow-danger:${colors.danger}`,
    `--ow-shadow:${colors.shadow}`,
    `--ow-font:${typography.fontFamily}`,
    `--ow-font-mono:${typography.monoFamily}`,
    `--ow-font-size:${typography.fontSize}px`,
    `--ow-label-weight:${typography.labelWeight}`,
    `--ow-node-radius:${geometry.nodeRadius}px`,
    `--ow-group-radius:${geometry.groupRadius}px`,
    `--ow-edge-width:${geometry.edgeWidth}px`,
  ].join(';')
}

function stylesheet(prefix: string): string {
  return `
.orbweaver{font-family:var(--ow-font);font-size:var(--ow-font-size);background:var(--ow-canvas);color:var(--ow-text)}
.ow-canvas{fill:var(--ow-canvas)}
.ow-group-surface{fill:var(--ow-surface-muted);stroke:var(--ow-border);stroke-width:1;stroke-dasharray:5 5}
.ow-group-label-bg{fill:var(--ow-canvas)}
.ow-group-label{fill:var(--ow-text-muted);font-family:var(--ow-font-mono);font-size:10px;font-weight:600;letter-spacing:1.1px;text-transform:uppercase}
.ow-edge-path{fill:none;stroke:var(--ow-edge);stroke-width:var(--ow-edge-width);stroke-linecap:round;stroke-linejoin:round}
.ow-edge-hit{fill:none;stroke:transparent;stroke-width:16;stroke-linecap:round;stroke-linejoin:round;pointer-events:stroke}
.ow-edge{cursor:pointer}
.ow-edge[data-edge-type="error"] .ow-edge-path{stroke:var(--ow-danger)}
.ow-edge[data-edge-type="event"] .ow-edge-path{stroke-dasharray:5 5}
.ow-edge-label-bg{fill:var(--ow-canvas);stroke:var(--ow-border);stroke-width:1}
.ow-edge-label{fill:var(--ow-edge-label);font-size:11px;font-weight:600}
.ow-node{cursor:default;outline:none}
.ow-node-surface{fill:var(--ow-surface-raised);stroke:var(--ow-border-strong);stroke-width:1.25;filter:url(#${prefix}-shadow)}
.ow-node:hover .ow-node-surface{stroke:var(--ow-accent)}
.ow-node:focus-visible .ow-node-surface{stroke:var(--ow-focus);stroke-width:2.5}
.ow-node[data-selected] .ow-node-surface{stroke:var(--ow-selection);stroke-width:2.75}
.ow-edge[data-selected] .ow-edge-path{stroke:var(--ow-selection);stroke-width:3}
.ow-node[data-related] .ow-node-surface{stroke:var(--ow-accent)}
.ow-edge[data-related] .ow-edge-path{stroke:var(--ow-accent);stroke-width:2.25}
.ow-group[data-selected] .ow-group-surface{stroke:var(--ow-selection);stroke-width:2}
.ow-has-selection [data-muted]{opacity:.18}
.ow-node-accent{fill:var(--ow-accent)}
.ow-node-label{fill:var(--ow-text);font-weight:var(--ow-label-weight);text-anchor:middle;dominant-baseline:middle}
.ow-node-type{fill:var(--ow-text-muted);font-family:var(--ow-font-mono);font-size:9px;font-weight:600;letter-spacing:.9px;text-anchor:middle;text-transform:uppercase}
.ow-node[data-node-status="critical"] .ow-node-surface,.ow-node[data-node-status="error"] .ow-node-surface{stroke:var(--ow-danger)}
.ow-node[data-node-status="warning"] .ow-node-surface{stroke:var(--ow-warning)}
.ow-node[data-node-status="healthy"] .ow-node-surface{stroke:var(--ow-success)}
@media (prefers-reduced-motion:no-preference){.ow-node-surface,.ow-edge-path{transition:stroke .16s ease,opacity .16s ease}}
`
}

function polylinePath(points: readonly Point[]): string {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
}

function longestSegmentMidpoint(points: readonly Point[]): Point {
  let best = { length: -1, point: points[0] ?? { x: 0, y: 0 } }
  for (let index = 1; index < points.length; index += 1) {
    const first = points[index - 1]
    const second = points[index]
    if (first === undefined || second === undefined) continue
    const length = Math.hypot(second.x - first.x, second.y - first.y)
    if (length > best.length) {
      best = { length, point: { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 } }
    }
  }
  return best.point
}

function markerAttributes(edge: Edge, prefix: string): string {
  const direction = edge.direction ?? 'forward'
  const start = direction === 'backward' || direction === 'both' ? ` marker-start="url(#${prefix}-arrow-start)"` : ''
  const end = direction === 'forward' || direction === 'both' ? ` marker-end="url(#${prefix}-arrow-end)"` : ''
  return `${start}${end}`
}

function renderEdge(sceneEdge: SceneEdge, graph: NormalizedGraph, prefix: string): string {
  const edge = graph.edges.find((candidate) => candidate.id === sceneEdge.edgeId)
  if (edge === undefined) return ''
  const type = safeToken(edge.type ?? 'generic')
  const path = polylinePath(sceneEdge.points)
  let label = ''
  if (edge.label !== undefined && edge.label.trim() !== '') {
    const fallback = longestSegmentMidpoint(sceneEdge.points)
    const width = sceneEdge.label?.width ?? Math.max(32, edge.label.length * 7 + 16)
    const height = sceneEdge.label?.height ?? 22
    const midpoint = sceneEdge.label === undefined
      ? fallback
      : { x: sceneEdge.label.x + width / 2, y: sceneEdge.label.y + height / 2 }
    label = `<g class="ow-edge-label-wrap" transform="translate(${midpoint.x} ${midpoint.y})"><rect class="ow-edge-label-bg" x="${-width / 2}" y="${-height / 2}" width="${width}" height="${height}" rx="7"/><text class="ow-edge-label" text-anchor="middle" dominant-baseline="middle">${escapeXml(edge.label)}</text></g>`
  }
  return `<g class="ow-edge" data-edge-id="${escapeXml(edge.id)}" data-edge-type="${escapeXml(type)}"><path class="ow-edge-hit" d="${path}" aria-hidden="true"/><path class="ow-edge-path" d="${path}"${markerAttributes(edge, prefix)}/>${label}</g>`
}

function wrapLabel(label: string, width: number): string[] {
  const maxCharacters = Math.max(8, Math.floor((width - 36) / 7.5))
  const words = label.trim().split(/\s+/)
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const candidate = current === '' ? word : `${current} ${word}`
    if (candidate.length <= maxCharacters || current === '') {
      current = candidate
    } else {
      lines.push(current)
      current = word
    }
  }
  if (current !== '') lines.push(current)
  return lines.length === 0 ? [''] : lines.slice(0, 3)
}

function surface(node: Node, sceneNode: SceneNode): string {
  const { width, height } = sceneNode
  const type = node.type ?? 'generic'
  if (type === 'decision') {
    const cut = Math.min(20, height / 3)
    return `<path class="ow-node-surface" d="M ${cut} 0 H ${width - cut} L ${width} ${height / 2} L ${width - cut} ${height} H ${cut} L 0 ${height / 2} Z"/>`
  }
  if (type === 'document') {
    const fold = 18
    return `<path class="ow-node-surface" d="M 0 0 H ${width - fold} L ${width} ${fold} V ${height} H 0 Z"/><path d="M ${width - fold} 0 V ${fold} H ${width}" fill="none" stroke="var(--ow-border-strong)"/>`
  }
  if (type === 'database') {
    return `<path class="ow-node-surface" d="M 0 10 C 0 3 18 0 ${width / 2} 0 C ${width - 18} 0 ${width} 3 ${width} 10 V ${height - 10} C ${width} ${height - 3} ${width - 18} ${height} ${width / 2} ${height} C 18 ${height} 0 ${height - 3} 0 ${height - 10} Z"/><path d="M 0 10 C 0 17 18 20 ${width / 2} 20 C ${width - 18} 20 ${width} 17 ${width} 10" fill="none" stroke="var(--ow-border-strong)"/>`
  }
  return `<rect class="ow-node-surface" width="${width}" height="${height}" rx="var(--ow-node-radius)"/>`
}

function renderNode(sceneNode: SceneNode, graph: NormalizedGraph): string {
  const node = graph.nodes.find((candidate) => candidate.id === sceneNode.nodeId)
  if (node === undefined) return ''
  const type = safeToken(node.type ?? 'generic')
  const status = safeToken(node.status ?? 'default')
  const lines = wrapLabel(node.label, sceneNode.width)
  const lineHeight = 17
  const hasType = node.type !== undefined
  const labelCenter = sceneNode.height / 2 - (hasType ? 5 : 0)
  const firstY = labelCenter - ((lines.length - 1) * lineHeight) / 2
  const text = lines.map((line, index) => `<tspan x="${sceneNode.width / 2}" y="${firstY + index * lineHeight}">${escapeXml(line)}</tspan>`).join('')
  const typeLabel = hasType ? `<text class="ow-node-type" x="${sceneNode.width / 2}" y="${sceneNode.height - 10}">${escapeXml(node.type ?? '')}</text>` : ''
  const accent = type === 'service' || type === 'process' ? `<rect class="ow-node-accent" x="0" y="12" width="3" height="${Math.max(12, sceneNode.height - 24)}" rx="1.5"/>` : ''
  const description = node.description === undefined ? '' : ` ${node.description}`

  return `<g class="ow-node" transform="translate(${sceneNode.x} ${sceneNode.y})" data-node-id="${escapeXml(node.id)}" data-node-type="${escapeXml(type)}" data-node-status="${escapeXml(status)}" tabindex="0" role="listitem" aria-label="${escapeXml(`${node.label}.${description}`)}">${surface(node, sceneNode)}${accent}<text class="ow-node-label">${text}</text>${typeLabel}</g>`
}

function sceneGroup(scene: Scene, index: number) {
  const groupShape = scene.groups[index]
  if (groupShape === undefined) return undefined
  const group = scene.graph.groups?.find((candidate) => candidate.id === groupShape.groupId)
  if (group === undefined) return undefined
  return { group, groupShape }
}

function renderGroupSurface(scene: Scene, index: number): string {
  const entry = sceneGroup(scene, index)
  if (entry === undefined) return ''
  const { group, groupShape } = entry
  return `<g class="ow-group" data-group-id="${escapeXml(group.id)}" tabindex="0" role="group" aria-label="${escapeXml(group.label)}"><rect class="ow-group-surface" x="${groupShape.x}" y="${groupShape.y}" width="${groupShape.width}" height="${groupShape.height}" rx="var(--ow-group-radius)"/></g>`
}

function renderGroupLabel(scene: Scene, index: number): string {
  const entry = sceneGroup(scene, index)
  if (entry === undefined) return ''
  const { group, groupShape } = entry
  const labelWidth = Math.max(72, group.label.length * 7 + 20)
  return `<g class="ow-group-label-wrap" data-group-id="${escapeXml(group.id)}"><rect class="ow-group-label-bg" x="${groupShape.x + 16}" y="${groupShape.y - 1}" width="${labelWidth}" height="22" rx="7"/><text class="ow-group-label" x="${groupShape.x + 26}" y="${groupShape.y + 14}">${escapeXml(group.label)}</text></g>`
}

function definitions(prefix: string): string {
  return `<defs><filter id="${prefix}-shadow" x="-20%" y="-30%" width="140%" height="170%"><feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="var(--ow-shadow)"/></filter><marker id="${prefix}-arrow-end" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ow-edge)"/></marker><marker id="${prefix}-arrow-start" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 10 0 L 0 5 L 10 10 z" fill="var(--ow-edge)"/></marker></defs>`
}

export class SvgRenderer implements Renderer<string> {
  render(scene: Scene, options: SvgRenderOptions = {}): string {
    const theme = options.theme ?? lightTheme
    const prefix = `ow-${safeToken(scene.graph.id)}`
    const titleId = `${prefix}-title`
    const descriptionId = `${prefix}-description`
    const className = ['orbweaver', options.className].filter(Boolean).join(' ')
    const width = options.responsive === false ? ` width="${scene.width}" height="${scene.height}"` : ' width="100%"'
    const summary = summarizeGraph(scene.graph)
    const groupSurfaces = scene.groups.map((_group, index) => renderGroupSurface(scene, index)).join('')
    const groupLabels = scene.groups.map((_group, index) => renderGroupLabel(scene, index)).join('')
    const edges = scene.edges.map((edge) => renderEdge(edge, scene.graph, prefix)).join('')
    const nodes = scene.nodes.map((node) => renderNode(node, scene.graph)).join('')
    const summaryElement = options.includeSummary === false ? '' : `<metadata class="ow-summary">${escapeXml(summary)}</metadata>`

    return `<svg xmlns="http://www.w3.org/2000/svg" class="${escapeXml(className)}" viewBox="0 0 ${scene.width} ${scene.height}"${width} role="img" aria-labelledby="${titleId} ${descriptionId}" style="${escapeXml(cssVariables(theme))}" data-theme="${escapeXml(theme.id)}"><title id="${titleId}">${escapeXml(scene.graph.title ?? scene.graph.id)}</title><desc id="${descriptionId}">${escapeXml(scene.graph.description ?? summary)}</desc>${summaryElement}${definitions(prefix)}<style>${stylesheet(prefix)}</style><rect class="ow-canvas" width="${scene.width}" height="${scene.height}" rx="12"/><g class="ow-groups">${groupSurfaces}</g><g class="ow-edges">${edges}</g><g class="ow-group-labels">${groupLabels}</g><g class="ow-nodes" role="list">${nodes}</g></svg>`
  }
}

export function renderSvg(scene: Scene, options?: SvgRenderOptions): string {
  return new SvgRenderer().render(scene, options)
}
