import { summarizeGraph } from '../accessibility/summarize.js'
import { ArtifactExportError } from '../errors.js'
import { layoutGraph } from '../layout/layout.js'
import type { Graph } from '../model/types.js'
import { renderSvg } from '../render/svg.js'
import { lightTheme } from '../theme/defaults.js'
import {
  svgArtifactVersion,
  type SvgArtifact,
  type SvgArtifactManifest,
  type SvgArtifactOptions,
} from './types.js'

function dimensions(svg: string): { width: number; height: number } {
  const match = svg.match(/\bviewBox="0 0 ([0-9.]+) ([0-9.]+)"/)
  const width = Number(match?.[1])
  const height = Number(match?.[2])
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new ArtifactExportError('Rendered SVG does not contain a valid positive viewBox.')
  }
  return { width, height }
}

export async function renderSvgArtifact(graph: Graph, options: SvgArtifactOptions = {}): Promise<SvgArtifact> {
  const scene = await layoutGraph(graph, options.layout)
  const summary = summarizeGraph(scene.graph)
  const theme = options.render?.theme ?? lightTheme
  const manifest: SvgArtifactManifest = {
    format: 'orbweaver-svg',
    version: svgArtifactVersion,
    graph: structuredClone(scene.graph),
    summary,
    theme: theme.id,
    guarantees: {
      accessibleText: true,
      semanticIdentity: true,
      semanticGraph: 'embedded',
      interaction: 'host-provided',
      inspector: 'host-provided',
      scalable: true,
    },
    ...(options.provenance === undefined ? {} : { provenance: structuredClone(options.provenance) }),
  }
  const svg = renderSvg(scene, {
    ...options.render,
    responsive: options.render?.responsive ?? false,
    embeddedMetadata: [{ className: 'ow-export-manifest', content: JSON.stringify(manifest) }],
  })
  const size = dimensions(svg)
  return {
    format: 'svg',
    mimeType: 'image/svg+xml',
    ...size,
    data: `<?xml version="1.0" encoding="UTF-8"?>\n${svg}`,
    manifest,
  }
}
