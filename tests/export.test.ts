import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ArtifactExportError,
  createBrowserPngRasterizer,
  darkTheme,
  getSemanticLensRecipe,
  renderPngArtifact,
  renderSvgArtifact,
  type Graph,
  type PngRasterizer,
} from '../src/index.js'

afterEach(() => vi.unstubAllGlobals())

const graph: Graph = {
  id: 'export-contract',
  title: 'Export contract',
  description: 'A portable relationship with review context.',
  groups: [{ id: 'system', label: 'System boundary' }],
  nodes: [
    { id: 'source', type: 'document', label: 'Source', group: 'system' },
    { id: 'review', type: 'process', label: 'Review', group: 'system', status: 'warning' },
  ],
  edges: [{ id: 'submit', from: 'source', to: 'review', type: 'flow', label: 'Submit' }],
  annotations: [{
    id: 'review-risk',
    target: { kind: 'node', id: 'review' },
    type: 'risk',
    severity: 'warning',
    body: 'A person must verify the exported result.',
  }],
}

describe('static artifact export', () => {
  it('creates deterministic, standalone SVG with an embedded semantic manifest', async () => {
    const options = {
      render: {
        theme: darkTheme,
        includeLegend: true,
        lens: getSemanticLensRecipe('risk'),
        frame: { version: '2.0', renderer: 'Orbweaver test' },
      },
      provenance: { generatedAt: '2026-08-29T18:00:00Z', source: { file: 'export.rcl' } },
    }
    const first = await renderSvgArtifact(graph, options)
    const second = await renderSvgArtifact(graph, options)

    expect(first).toEqual(second)
    expect(first.mimeType).toBe('image/svg+xml')
    expect(first.width).toBeGreaterThan(0)
    expect(first.height).toBeGreaterThan(0)
    expect(first.data).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>\n<svg /)
    expect(first.data).toContain(`width="${first.width}" height="${first.height}"`)
    expect(first.data).toContain('class="ow-export-manifest"')
    expect(first.data).toContain('&quot;format&quot;:&quot;orbweaver-svg&quot;')
    expect(first.data).toContain('&quot;annotations&quot;:')
    expect(first.data).toContain('data-lens-id="risk"')
    expect(first.data).toContain('data-legend="generated"')
    expect(first.manifest.graph.edges[0]?.id).toBe('submit')
    expect(first.manifest.guarantees.semanticGraph).toBe('embedded')
    expect(first.manifest.provenance?.source?.file).toBe('export.rcl')
  })

  it('keeps embedded export metadata inert and XML escaped', async () => {
    const unsafe: Graph = { ...graph, title: '</metadata><script>alert(1)</script>' }
    const artifact = await renderSvgArtifact(unsafe)
    expect(artifact.data).not.toContain('<script>')
    expect(artifact.data).toContain('&lt;/metadata&gt;&lt;script&gt;alert(1)&lt;/script&gt;')
  })

  it('rasterizes the exact SVG through an explicit lightweight adapter', async () => {
    const bytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])
    const rasterizer = vi.fn<PngRasterizer>(async () => bytes)
    const artifact = await renderPngArtifact(graph, {
      scale: 2,
      background: '#080c14',
      render: { theme: darkTheme, includeLegend: true },
      rasterizer,
    })

    expect(artifact.mimeType).toBe('image/png')
    expect(artifact.data).toEqual(bytes)
    expect(artifact.width).toBe(artifact.manifest.width)
    expect(artifact.height).toBe(artifact.manifest.height)
    expect(artifact.manifest.scale).toBe(2)
    expect(artifact.manifest.guarantees.semanticGraph).toBe('companion')
    expect(artifact.altText).toContain('Export contract')
    expect(rasterizer).toHaveBeenCalledOnce()
    const input = rasterizer.mock.calls[0]?.[0]
    expect(input?.svg).toContain('class="ow-export-manifest"')
    expect(input?.scale).toBe(2)
    expect(input?.background).toBe('#080c14')
  })

  it('reports unsupported or unsafe PNG output actionably', async () => {
    await expect(renderPngArtifact(graph)).rejects.toThrow(/In Node\.js, pass a PngRasterizer adapter explicitly/)
    await expect(renderPngArtifact(graph, { scale: 0, rasterizer: async () => new Uint8Array([1]) })).rejects.toThrow(ArtifactExportError)
    await expect(renderPngArtifact(graph, { scale: 5, rasterizer: async () => new Uint8Array([1]) })).rejects.toThrow(/no greater than 4/)
    await expect(renderPngArtifact(graph, { rasterizer: async () => new Uint8Array() })).rejects.toThrow(/returned no image bytes/)
  })

  it('uses native browser image and canvas APIs without leaking object URLs', async () => {
    const drawImage = vi.fn()
    const fillRect = vi.fn()
    const revokeObjectURL = vi.fn()
    const canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({ drawImage, fillRect, fillStyle: '' })),
      toBlob: (callback: (value: Blob | null) => void) => callback(new Blob([new Uint8Array([137, 80, 78, 71])], { type: 'image/png' })),
    }
    class TestImage {
      decoding = ''
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      set src(_value: string) { queueMicrotask(() => this.onload?.()) }
    }
    vi.stubGlobal('document', { createElement: vi.fn(() => canvas) })
    vi.stubGlobal('Image', TestImage)
    vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:orbweaver'), revokeObjectURL })

    const bytes = await createBrowserPngRasterizer()({
      svg: '<svg xmlns="http://www.w3.org/2000/svg"/>',
      width: 320,
      height: 180,
      scale: 2,
      background: '#080c14',
    })

    expect(bytes).toEqual(new Uint8Array([137, 80, 78, 71]))
    expect(canvas.width).toBe(640)
    expect(canvas.height).toBe(360)
    expect(fillRect).toHaveBeenCalledWith(0, 0, 640, 360)
    expect(drawImage).toHaveBeenCalledOnce()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:orbweaver')
  })
})
