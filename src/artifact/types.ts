import type { LayoutGraphOptions } from '../layout/types.js'
import type { Metadata, NormalizedGraph, Provenance } from '../model/types.js'
import type { SvgRenderOptions } from '../render/types.js'
import { contractVersions } from '../compatibility/versions.js'

export const portableHtmlArtifactVersion = contractVersions.portableHtml

export type PortableArtifactTheme = 'dark' | 'light'

export interface PortableArtifactProvenance {
  renderer?: string
  generatedAt?: string
  source?: Provenance
  metadata?: Metadata
}

export interface HtmlArtifactOptions {
  layout?: LayoutGraphOptions
  render?: Omit<SvgRenderOptions, 'responsive' | 'theme'>
  theme?: PortableArtifactTheme
  allowThemeSwitch?: boolean
  provenance?: PortableArtifactProvenance
}

export interface PortableHtmlArtifactManifest {
  format: 'orbweaver-portable-html'
  version: typeof portableHtmlArtifactVersion
  graph: NormalizedGraph
  summary: string
  theme: PortableArtifactTheme
  allowThemeSwitch: boolean
  themes: Record<PortableArtifactTheme, Record<string, string>>
  provenance?: PortableArtifactProvenance
}
