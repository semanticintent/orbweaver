export type SemanticDetailLevel = 'overview' | 'standard' | 'close'

export interface SemanticDetailThresholds {
  overviewBelow?: number
  closeAt?: number
}

export const defaultSemanticDetailThresholds: Readonly<Required<SemanticDetailThresholds>> = {
  overviewBelow: 1.2,
  closeAt: 2,
}

export function recommendSemanticDetailLevel(
  zoom: number,
  thresholds: SemanticDetailThresholds = {},
): SemanticDetailLevel {
  const overviewBelow = thresholds.overviewBelow ?? defaultSemanticDetailThresholds.overviewBelow
  const closeAt = thresholds.closeAt ?? defaultSemanticDetailThresholds.closeAt
  if (!Number.isFinite(zoom) || zoom <= 0) throw new RangeError('Zoom must be a finite number greater than zero.')
  if (!Number.isFinite(overviewBelow) || !Number.isFinite(closeAt) || overviewBelow <= 0 || closeAt <= overviewBelow) {
    throw new RangeError('Detail thresholds must be finite, positive, and ordered so closeAt is greater than overviewBelow.')
  }
  if (zoom < overviewBelow) return 'overview'
  if (zoom >= closeAt) return 'close'
  return 'standard'
}
