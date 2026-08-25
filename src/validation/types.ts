export type ValidationSeverity = 'error' | 'warning'

export type ValidationEntityKind =
  | 'graph'
  | 'node'
  | 'edge'
  | 'group'
  | 'annotation'

export interface ValidationIssue {
  code: string
  severity: ValidationSeverity
  message: string
  entity?: {
    kind: ValidationEntityKind
    id: string
  }
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
}
