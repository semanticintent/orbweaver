import type { ValidationIssue } from './validation/types.js'
import type { CompatibilityDiagnostic } from './compatibility/types.js'

export class OrbweaverError extends Error {
  override readonly name: string = 'OrbweaverError'
}

export class GraphValidationError extends OrbweaverError {
  override readonly name = 'GraphValidationError'

  constructor(readonly issues: readonly ValidationIssue[]) {
    super(issues.map((entry) => entry.message).join('\n'))
  }
}

export class LayoutError extends OrbweaverError {
  override readonly name = 'LayoutError'

  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
  }
}

export class ArtifactExportError extends OrbweaverError {
  override readonly name = 'ArtifactExportError'
  readonly code: string
  readonly action: string

  constructor(message: string, options: ErrorOptions & { code?: string; action?: string } = {}) {
    super(message, options)
    this.code = options.code ?? 'artifact-export-failed'
    this.action = options.action ?? 'Review the export options and retry with a supported renderer.'
  }
}

export class ContractCompatibilityError extends OrbweaverError {
  override readonly name = 'ContractCompatibilityError'

  constructor(readonly diagnostics: readonly CompatibilityDiagnostic[]) {
    super(diagnostics.map((entry) => `${entry.message} ${entry.action}`).join('\n'))
  }
}
