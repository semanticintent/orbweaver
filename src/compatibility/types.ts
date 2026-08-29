import type { NormalizedGraph } from '../model/types.js'
import type { Scene } from '../scene/types.js'
import type { contractVersions } from './versions.js'

export type ContractKind = keyof typeof contractVersions
export type ContractVersion = typeof contractVersions[ContractKind]
export type CompatibilitySeverity = 'error' | 'warning'

export interface CompatibilityDiagnostic {
  code: string
  severity: CompatibilitySeverity
  message: string
  action: string
  path?: string
}

export interface ContractCompatibilityResult {
  compatible: boolean
  kind: ContractKind
  currentVersion: ContractVersion
  detectedVersion?: string
  diagnostics: CompatibilityDiagnostic[]
}

export interface GraphDocument {
  format: 'orbweaver-graph'
  version: typeof contractVersions.graph
  graph: NormalizedGraph
}

export interface SceneDocument {
  format: 'orbweaver-scene'
  version: typeof contractVersions.scene
  scene: Scene
}

export interface ValidContractReadResult<TDocument> {
  compatible: true
  document: TDocument
  diagnostics: CompatibilityDiagnostic[]
}

export interface InvalidContractReadResult {
  compatible: false
  diagnostics: CompatibilityDiagnostic[]
}

export type ContractReadResult<TDocument> = ValidContractReadResult<TDocument> | InvalidContractReadResult
