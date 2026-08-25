import type { LayoutGraphOptions } from '../layout/types.js'
import type { OrbweaverTheme } from '../theme/types.js'

export interface SvgRenderOptions {
  theme?: OrbweaverTheme
  className?: string
  responsive?: boolean
  includeSummary?: boolean
}

export interface RenderGraphOptions {
  layout?: LayoutGraphOptions
  render?: SvgRenderOptions
}

export interface Renderer<TOutput> {
  render(scene: import('../scene/types.js').Scene, options?: SvgRenderOptions): TOutput
}
