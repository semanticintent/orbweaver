import type { LayoutGraphOptions } from '../layout/types.js'
import type { OrbweaverTheme } from '../theme/types.js'
import type { SemanticLens } from '../semantic/lenses.js'
import type { SemanticDetailLevel } from '../semantic/detail.js'
import type { PathNarrativeProjection } from '../semantic/paths.js'

export interface SvgArtifactFrameOptions {
  title?: string
  description?: string
  version?: string
  asOf?: string
  generatedAt?: string
  renderer?: string
}

export interface SvgRenderOptions {
  theme?: OrbweaverTheme
  className?: string
  responsive?: boolean
  includeSummary?: boolean
  frame?: SvgArtifactFrameOptions
  lens?: SemanticLens
  detailLevel?: SemanticDetailLevel
  narrative?: PathNarrativeProjection
}

export interface RenderGraphOptions {
  layout?: LayoutGraphOptions
  render?: SvgRenderOptions
}

export interface Renderer<TOutput> {
  render(scene: import('../scene/types.js').Scene, options?: SvgRenderOptions): TOutput
}
