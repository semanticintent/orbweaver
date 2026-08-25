import type { Node } from '../model/types.js'

export interface Size {
  width: number
  height: number
}

const MIN_WIDTH = 140
const MAX_WIDTH = 260
const MIN_HEIGHT = 56
const HORIZONTAL_PADDING = 40
const VERTICAL_PADDING = 28
const APPROXIMATE_CHARACTER_WIDTH = 7.5
const LINE_HEIGHT = 18

export function estimateNodeSize(node: Node): Size {
  const unwrappedWidth = node.label.length * APPROXIMATE_CHARACTER_WIDTH + HORIZONTAL_PADDING
  const width = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.ceil(unwrappedWidth)))
  const availableTextWidth = width - HORIZONTAL_PADDING
  const textWidth = Math.max(APPROXIMATE_CHARACTER_WIDTH, node.label.length * APPROXIMATE_CHARACTER_WIDTH)
  const lines = Math.max(1, Math.ceil(textWidth / availableTextWidth))
  const height = Math.max(MIN_HEIGHT, lines * LINE_HEIGHT + VERTICAL_PADDING)
  return { width, height }
}
