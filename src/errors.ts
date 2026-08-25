import type { ValidationIssue } from './validation/types.js'

export class OrbweaverError extends Error {
  override readonly name: string = 'OrbweaverError'
}

export class GraphValidationError extends OrbweaverError {
  override readonly name = 'GraphValidationError'

  constructor(readonly issues: readonly ValidationIssue[]) {
    super(issues.map((entry) => entry.message).join('\n'))
  }
}
