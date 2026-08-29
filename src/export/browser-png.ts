import { ArtifactExportError } from '../errors.js'
import type { PngRasterizeInput, PngRasterizer } from './types.js'

const maximumPixels = 64_000_000

function browserRasterizerAvailable(): boolean {
  return typeof document !== 'undefined' && typeof Image !== 'undefined' && typeof URL !== 'undefined' && typeof Blob !== 'undefined'
}

export function createBrowserPngRasterizer(): PngRasterizer {
  return async (input: PngRasterizeInput): Promise<Uint8Array> => {
    if (!browserRasterizerAvailable()) {
      throw new ArtifactExportError('Browser PNG rasterization requires document, Image, Blob, and URL APIs. In Node.js, pass a PngRasterizer adapter explicitly.')
    }
    const outputWidth = Math.round(input.width * input.scale)
    const outputHeight = Math.round(input.height * input.scale)
    if (outputWidth * outputHeight > maximumPixels) {
      throw new ArtifactExportError(`PNG output exceeds the ${maximumPixels.toLocaleString('en-US')} pixel safety limit.`)
    }

    const source = URL.createObjectURL(new Blob([input.svg], { type: 'image/svg+xml;charset=utf-8' }))
    try {
      const image = new Image()
      image.decoding = 'sync'
      const loaded = new Promise<void>((resolve, reject) => {
        image.onload = () => resolve()
        image.onerror = () => reject(new ArtifactExportError('The browser could not decode the rendered SVG for PNG export.'))
      })
      image.src = source
      await loaded

      const canvas = document.createElement('canvas')
      canvas.width = outputWidth
      canvas.height = outputHeight
      const context = canvas.getContext('2d')
      if (context === null) throw new ArtifactExportError('The browser could not create a 2D canvas for PNG export.')
      if (input.background !== undefined) {
        context.fillStyle = input.background
        context.fillRect(0, 0, outputWidth, outputHeight)
      }
      context.drawImage(image, 0, 0, outputWidth, outputHeight)
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((value) => value === null ? reject(new ArtifactExportError('The browser could not encode the PNG output.')) : resolve(value), 'image/png')
      })
      return new Uint8Array(await blob.arrayBuffer())
    } finally {
      URL.revokeObjectURL(source)
    }
  }
}
