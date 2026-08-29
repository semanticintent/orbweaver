export interface SvgViewportPoint {
  x: number
  y: number
}

export interface SvgViewportState {
  zoom: number
  canZoomIn: boolean
  canZoomOut: boolean
}

export interface SvgViewportOptions {
  minZoom?: number
  maxZoom?: number
  zoomStep?: number
  onViewChange?: (state: SvgViewportState) => void
}

export interface SvgViewportController {
  readonly zoom: number
  readonly state: SvgViewportState
  zoomIn(anchor?: SvgViewportPoint): void
  zoomOut(anchor?: SvgViewportPoint): void
  setZoom(zoom: number, anchor?: SvgViewportPoint): void
  /** Centers the current viewport on a point in SVG viewBox coordinates. */
  centerOn(point: SvgViewportPoint): void
  fit(): void
  destroy(): void
}

interface ViewBox {
  x: number
  y: number
  width: number
  height: number
}

function readViewBox(svg: SVGSVGElement): ViewBox {
  const values = (svg.getAttribute('viewBox') ?? '').trim().split(/[ ,]+/).map(Number)
  if (values.length !== 4 || values.some((value) => !Number.isFinite(value))) {
    throw new TypeError('Orbweaver viewport requires an SVG with a valid viewBox.')
  }
  const [x = 0, y = 0, width = 0, height = 0] = values
  if (width <= 0 || height <= 0) {
    throw new TypeError('Orbweaver viewport requires a viewBox with positive dimensions.')
  }
  return { x, y, width, height }
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value))
}

function same(a: number, b: number): boolean {
  return Math.abs(a - b) < 0.000_001
}

function clientAnchor(svg: SVGSVGElement, point: SvgViewportPoint | undefined): SvgViewportPoint {
  const bounds = svg.getBoundingClientRect()
  if (point === undefined || bounds.width <= 0 || bounds.height <= 0) return { x: 0.5, y: 0.5 }
  return {
    x: clamp((point.x - bounds.left) / bounds.width, 0, 1),
    y: clamp((point.y - bounds.top) / bounds.height, 0, 1),
  }
}

export function mountSvgViewport(
  svg: SVGSVGElement,
  options: SvgViewportOptions = {},
): SvgViewportController {
  const originalAttribute = svg.getAttribute('viewBox')
  const original = readViewBox(svg)
  const minZoom = options.minZoom ?? 1
  const maxZoom = options.maxZoom ?? 4
  const zoomStep = options.zoomStep ?? 1.25
  if (!(minZoom > 0) || minZoom > 1 || maxZoom < 1 || !(zoomStep > 1)) {
    throw new RangeError('Viewport zoom limits must contain 1, remain positive, and use a step greater than one.')
  }

  let zoom = 1
  let destroyed = false
  let viewBox = { ...original }
  let spacePressed = false
  let pointerInside = false
  let panPointer: number | undefined
  let panPoint: SvgViewportPoint | undefined
  const touches = new Map<number, SvgViewportPoint>()
  let pinchDistance: number | undefined
  let pinchCenter: SvgViewportPoint | undefined
  const previousTouchAction = svg.style.touchAction

  const state = (): SvgViewportState => ({
    zoom,
    canZoomIn: zoom < maxZoom,
    canZoomOut: zoom > minZoom,
  })

  const constrain = (candidate: ViewBox): ViewBox => {
    const maxX = original.x + original.width - candidate.width
    const maxY = original.y + original.height - candidate.height
    return {
      ...candidate,
      x: candidate.width >= original.width
        ? original.x + (original.width - candidate.width) / 2
        : clamp(candidate.x, original.x, maxX),
      y: candidate.height >= original.height
        ? original.y + (original.height - candidate.height) / 2
        : clamp(candidate.y, original.y, maxY),
    }
  }

  const commit = (candidate: ViewBox, nextZoom: number): void => {
    viewBox = constrain(candidate)
    zoom = nextZoom
    svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`)
    svg.toggleAttribute('data-ow-viewport-active', !same(zoom, 1))
    options.onViewChange?.(state())
  }

  const setZoom = (requested: number, point?: SvgViewportPoint): void => {
    const nextZoom = clamp(requested, minZoom, maxZoom)
    if (same(nextZoom, zoom)) return
    const anchor = clientAnchor(svg, point)
    const anchorX = viewBox.x + viewBox.width * anchor.x
    const anchorY = viewBox.y + viewBox.height * anchor.y
    const width = original.width / nextZoom
    const height = original.height / nextZoom
    commit({
      x: anchorX - width * anchor.x,
      y: anchorY - height * anchor.y,
      width,
      height,
    }, nextZoom)
  }

  const pan = (from: SvgViewportPoint, to: SvgViewportPoint): void => {
    if (same(zoom, minZoom)) return
    const bounds = svg.getBoundingClientRect()
    if (bounds.width <= 0 || bounds.height <= 0) return
    commit({
      ...viewBox,
      x: viewBox.x - (to.x - from.x) * viewBox.width / bounds.width,
      y: viewBox.y - (to.y - from.y) * viewBox.height / bounds.height,
    }, zoom)
  }

  const controller: SvgViewportController = {
    get zoom() { return zoom },
    get state() { return state() },
    zoomIn(anchor) { if (!destroyed) setZoom(zoom * zoomStep, anchor) },
    zoomOut(anchor) { if (!destroyed) setZoom(zoom / zoomStep, anchor) },
    setZoom(zoom, anchor) { if (!destroyed) setZoom(zoom, anchor) },
    centerOn(point) {
      if (destroyed || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return
      commit({
        ...viewBox,
        x: point.x - viewBox.width / 2,
        y: point.y - viewBox.height / 2,
      }, zoom)
    },
    fit() {
      if (destroyed) return
      if (same(zoom, 1) && viewBox.x === original.x && viewBox.y === original.y) return
      commit({ ...original }, 1)
    },
    destroy() {
      if (destroyed) return
      svg.removeEventListener('wheel', onWheel)
      svg.removeEventListener('pointerdown', onPointerDown)
      svg.removeEventListener('pointermove', onPointerMove)
      svg.removeEventListener('pointerup', onPointerEnd)
      svg.removeEventListener('pointercancel', onPointerEnd)
      svg.removeEventListener('pointerenter', onPointerEnter)
      svg.removeEventListener('pointerleave', onPointerLeave)
      svg.removeEventListener('keydown', onKeyDown)
      svg.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('keydown', onWindowKeyDown)
      window.removeEventListener('keyup', onWindowKeyUp)
      svg.style.touchAction = previousTouchAction
      svg.removeAttribute('data-ow-viewport-active')
      if (originalAttribute === null) svg.removeAttribute('viewBox')
      else svg.setAttribute('viewBox', originalAttribute)
      destroyed = true
    },
  }

  const onWheel = (event: WheelEvent): void => {
    if (!event.ctrlKey && !event.metaKey) return
    event.preventDefault()
    setZoom(zoom * Math.exp(-event.deltaY * 0.002), { x: event.clientX, y: event.clientY })
  }

  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === ' ') {
      spacePressed = true
      if (zoom > minZoom) event.preventDefault()
    }
    if (event.key === '+' || event.key === '=') {
      event.preventDefault()
      controller.zoomIn()
    } else if (event.key === '-') {
      event.preventDefault()
      controller.zoomOut()
    } else if (event.key === '0') {
      event.preventDefault()
      controller.fit()
    }
  }

  const onKeyUp = (event: KeyboardEvent): void => {
    if (event.key === ' ') spacePressed = false
  }
  const onWindowKeyUp = (event: KeyboardEvent): void => onKeyUp(event)
  const onWindowKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== ' ' || !pointerInside || zoom <= minZoom) return
    event.preventDefault()
    spacePressed = true
  }
  const onPointerEnter = (): void => { pointerInside = true }
  const onPointerLeave = (): void => { pointerInside = false }

  const onPointerDown = (event: PointerEvent): void => {
    const point = { x: event.clientX, y: event.clientY }
    if (event.pointerType === 'touch') {
      touches.set(event.pointerId, point)
      if (touches.size === 2) {
        const [first, second] = [...touches.values()]
        if (first !== undefined && second !== undefined) {
          pinchDistance = Math.hypot(second.x - first.x, second.y - first.y)
          pinchCenter = { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 }
        }
      }
      return
    }
    if (event.button !== 1 && !(event.button === 0 && spacePressed)) return
    event.preventDefault()
    panPointer = event.pointerId
    panPoint = point
    svg.setPointerCapture?.(event.pointerId)
  }

  const onPointerMove = (event: PointerEvent): void => {
    const point = { x: event.clientX, y: event.clientY }
    if (event.pointerType === 'touch' && touches.has(event.pointerId)) {
      touches.set(event.pointerId, point)
      if (touches.size !== 2) return
      const [first, second] = [...touches.values()]
      if (first === undefined || second === undefined) return
      const distance = Math.hypot(second.x - first.x, second.y - first.y)
      const center = { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 }
      if (pinchDistance !== undefined && pinchDistance > 0) setZoom(zoom * distance / pinchDistance, center)
      if (pinchCenter !== undefined) pan(pinchCenter, center)
      pinchDistance = distance
      pinchCenter = center
      event.preventDefault()
      return
    }
    if (event.pointerId !== panPointer || panPoint === undefined) return
    event.preventDefault()
    pan(panPoint, point)
    panPoint = point
  }

  const onPointerEnd = (event: PointerEvent): void => {
    touches.delete(event.pointerId)
    if (touches.size < 2) {
      pinchDistance = undefined
      pinchCenter = undefined
    }
    if (event.pointerId !== panPointer) return
    panPointer = undefined
    panPoint = undefined
    svg.releasePointerCapture?.(event.pointerId)
  }

  svg.style.touchAction = 'pan-x pan-y'
  svg.addEventListener('wheel', onWheel, { passive: false })
  svg.addEventListener('pointerdown', onPointerDown)
  svg.addEventListener('pointermove', onPointerMove)
  svg.addEventListener('pointerup', onPointerEnd)
  svg.addEventListener('pointercancel', onPointerEnd)
  svg.addEventListener('pointerenter', onPointerEnter)
  svg.addEventListener('pointerleave', onPointerLeave)
  svg.addEventListener('keydown', onKeyDown)
  svg.addEventListener('keyup', onKeyUp)
  window.addEventListener('keydown', onWindowKeyDown)
  window.addEventListener('keyup', onWindowKeyUp)
  options.onViewChange?.(state())
  return controller
}
