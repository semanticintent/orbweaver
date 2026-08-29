import { ArtifactExportError } from '../errors.js'
import type { Graph } from '../model/types.js'
import { createBrowserPngRasterizer } from './browser-png.js'
import { renderSvgArtifact } from './svg.js'
import {
  pngArtifactVersion,
  type PngArtifact,
  type PngArtifactOptions,
} from './types.js'

const maximumPixels = 64_000_000

function validateScale(scale: number): void {
  if (!Number.isFinite(scale) || scale <= 0 || scale > 4) {
    throw new ArtifactExportError('PNG scale must be greater than 0 and no greater than 4.', {
      code: 'png-scale-invalid',
      action: 'Choose a PNG scale in the range 0 < scale <= 4.',
    })
  }
}

export async function renderPngArtifact(graph: Graph, options: PngArtifactOptions = {}): Promise<PngArtifact> {
  const scale = options.scale ?? 1
  validateScale(scale)
  const svg = await renderSvgArtifact(graph, options)
  const outputWidth = Math.round(svg.width * scale)
  const outputHeight = Math.round(svg.height * scale)
  if (outputWidth * outputHeight > maximumPixels) {
    throw new ArtifactExportError(`PNG output exceeds the ${maximumPixels.toLocaleString('en-US')} pixel safety limit.`, {
      code: 'png-pixel-limit-exceeded',
      action: 'Reduce the export scale or render a smaller graph.',
    })
  }
  const rasterizer = options.rasterizer ?? createBrowserPngRasterizer()
  const data = await rasterizer({
    svg: svg.data,
    width: svg.width,
    height: svg.height,
    scale,
    ...(options.background === undefined ? {} : { background: options.background }),
  })
  if (!(data instanceof Uint8Array) || data.byteLength === 0) {
    throw new ArtifactExportError('PNG rasterizer returned no image bytes.', {
      code: 'png-output-empty',
      action: 'Verify that the rasterizer returns a non-empty Uint8Array containing PNG data.',
    })
  }
  return {
    format: 'png',
    mimeType: 'image/png',
    width: outputWidth,
    height: outputHeight,
    data,
    altText: svg.manifest.summary,
    manifest: {
      format: 'orbweaver-png',
      version: pngArtifactVersion,
      graphId: svg.manifest.graph.id,
      summary: svg.manifest.summary,
      theme: svg.manifest.theme,
      width: outputWidth,
      height: outputHeight,
      scale,
      guarantees: {
        accessibleText: false,
        semanticIdentity: false,
        semanticGraph: 'companion',
        interaction: 'none',
        inspector: 'none',
        scalable: false,
      },
      ...(options.provenance === undefined ? {} : { provenance: structuredClone(options.provenance) }),
    },
  }
}
