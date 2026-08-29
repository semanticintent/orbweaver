import type { Graph } from '../model/types.js'
import type { ValidationEntityKind, ValidationSeverity } from '../validation/types.js'
import type { graphProposalSchemaVersion } from '../compatibility/versions.js'

export interface ProposalGeneration {
  provider?: string
  model?: string
  adapter: string
}

export interface EvidenceReference {
  id: string
  label: string
  source?: string
  location?: string
}

export interface ProposalEntityReference {
  kind: 'node' | 'edge' | 'group'
  id: string
}

export interface ProposalClaim {
  entity: ProposalEntityReference
  evidenceIds: string[]
  confidence?: 'low' | 'medium' | 'high'
  rationale?: string
}

export interface GraphProposal {
  schemaVersion: typeof graphProposalSchemaVersion
  graph: Graph
  generation: ProposalGeneration
  evidence?: EvidenceReference[]
  claims?: ProposalClaim[]
  warnings?: string[]
}

export interface ProposalValidationLimits {
  maxBytes: number
  maxNodes: number
  maxEdges: number
  maxGroups: number
  maxAnnotations: number
  maxEvidence: number
  maxClaims: number
  maxLabelLength: number
  maxDescriptionLength: number
  maxMetadataDepth: number
}

export interface ProposalValidationOptions {
  limits?: Partial<ProposalValidationLimits>
}

export interface ProposalValidationIssue {
  code: string
  severity: ValidationSeverity
  message: string
  path: string
  entity?: {
    kind: ValidationEntityKind | 'proposal' | 'evidence' | 'claim'
    id: string
  }
}

export interface ValidProposalValidationResult {
  valid: true
  errors: ProposalValidationIssue[]
  warnings: ProposalValidationIssue[]
  proposal: GraphProposal
}

export interface InvalidProposalValidationResult {
  valid: false
  errors: ProposalValidationIssue[]
  warnings: ProposalValidationIssue[]
}

export type ProposalValidationResult =
  | ValidProposalValidationResult
  | InvalidProposalValidationResult
