import type { LayoutGraphOptions } from '../layout/types.js'
import type { NormalizedGraph } from '../model/types.js'
import type { SvgRenderOptions } from '../render/types.js'
import type { PortableArtifactProvenance } from '../artifact/types.js'
import { contractVersions } from '../compatibility/versions.js'

export const svgArtifactVersion = contractVersions.svg
export const pngArtifactVersion = contractVersions.png

export interface StaticArtifactGuarantees {
  accessibleText: boolean
  semanticIdentity: boolean
  semanticGraph: 'embedded' | 'companion'
  interaction: 'host-provided' | 'none'
  inspector: 'host-provided' | 'none'
  scalable: boolean
}

export interface SvgArtifactManifest {
  format: 'orbweaver-svg'
  version: typeof svgArtifactVersion
  graph: NormalizedGraph
  summary: string
  theme: string
  guarantees: StaticArtifactGuarantees
  provenance?: PortableArtifactProvenance
}

export interface PngArtifactManifest {
  format: 'orbweaver-png'
  version: typeof pngArtifactVersion
  graphId: string
  summary: string
  theme: string
  width: number
  height: number
  scale: number
  guarantees: StaticArtifactGuarantees
  provenance?: PortableArtifactProvenance
}

export interface SvgArtifactOptions {
  layout?: LayoutGraphOptions
  render?: Omit<SvgRenderOptions, 'embeddedMetadata'>
  provenance?: PortableArtifactProvenance
}

export interface SvgArtifact {
  format: 'svg'
  mimeType: 'image/svg+xml'
  width: number
  height: number
  data: string
  manifest: SvgArtifactManifest
}

export interface PngRasterizeInput {
  svg: string
  width: number
  height: number
  scale: number
  background?: string
}

export type PngRasterizer = (input: PngRasterizeInput) => Promise<Uint8Array>

export interface PngArtifactOptions extends SvgArtifactOptions {
  scale?: number
  background?: string
  rasterizer?: PngRasterizer
}

export interface PngArtifact {
  format: 'png'
  mimeType: 'image/png'
  width: number
  height: number
  data: Uint8Array
  altText: string
  manifest: PngArtifactManifest
}
