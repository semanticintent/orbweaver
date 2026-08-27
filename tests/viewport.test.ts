// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { mountSvgViewport, type SvgViewportState } from '../src/index.js'

function setup(onViewChange = vi.fn<(state: SvgViewportState) => void>()) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '10 20 800 400')
  Object.defineProperty(svg, 'getBoundingClientRect', {
    value: () => ({ x: 0, y: 0, left: 0, top: 0, right: 800, bottom: 400, width: 800, height: 400 }),
  })
  document.body.append(svg)
  const controller = mountSvgViewport(svg, { onViewChange })
  return { svg, controller, onViewChange }
}

function viewBox(svg: SVGSVGElement): number[] {
  return (svg.getAttribute('viewBox') ?? '').split(' ').map(Number)
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('SVG viewport controller', () => {
  it('zooms around the center, reports state, and restores fit', () => {
    const { svg, controller, onViewChange } = setup()
    expect(controller.state).toEqual({ zoom: 1, canZoomIn: true, canZoomOut: false })

    controller.zoomIn()
    expect(controller.zoom).toBe(1.25)
    expect(viewBox(svg)).toEqual([90, 60, 640, 320])
    expect(svg.hasAttribute('data-ow-viewport-active')).toBe(true)
    expect(onViewChange).toHaveBeenLastCalledWith({ zoom: 1.25, canZoomIn: true, canZoomOut: true })

    controller.fit()
    expect(viewBox(svg)).toEqual([10, 20, 800, 400])
    expect(svg.hasAttribute('data-ow-viewport-active')).toBe(false)
  })

  it('keeps zoom bounded and honors a client-space anchor', () => {
    const { svg, controller } = setup()
    controller.setZoom(20, { x: 800, y: 400 })
    expect(controller.zoom).toBe(4)
    expect(viewBox(svg)).toEqual([610, 320, 200, 100])

    controller.setZoom(0.01)
    expect(controller.zoom).toBe(1)
    expect(viewBox(svg)).toEqual([10, 20, 800, 400])
  })

  it('leaves ordinary wheel scrolling alone and supports modified wheel zoom', () => {
    const { svg, controller } = setup()
    const scroll = new WheelEvent('wheel', { deltaY: -100, cancelable: true })
    svg.dispatchEvent(scroll)
    expect(scroll.defaultPrevented).toBe(false)
    expect(controller.zoom).toBe(1)

    const zoom = new WheelEvent('wheel', { deltaY: -100, ctrlKey: true, cancelable: true, clientX: 400, clientY: 200 })
    Object.defineProperty(zoom, 'ctrlKey', { value: true })
    const preventDefault = vi.spyOn(zoom, 'preventDefault')
    svg.dispatchEvent(zoom)
    expect(preventDefault).toHaveBeenCalledOnce()
    expect(controller.zoom).toBeGreaterThan(1)
  })

  it('supports keyboard zoom and reset without consuming unrelated keys', () => {
    const { svg, controller } = setup()
    svg.dispatchEvent(new KeyboardEvent('keydown', { key: '+', bubbles: true, cancelable: true }))
    expect(controller.zoom).toBe(1.25)
    svg.dispatchEvent(new KeyboardEvent('keydown', { key: '0', bubbles: true, cancelable: true }))
    expect(controller.zoom).toBe(1)

    const arrow = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
    svg.dispatchEvent(arrow)
    expect(arrow.defaultPrevented).toBe(false)
  })

  it('pans a zoomed view with middle-button drag and keeps it in bounds', () => {
    const { svg, controller } = setup()
    controller.setZoom(2)
    svg.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 7, button: 1, clientX: 400, clientY: 200, bubbles: true }))
    svg.dispatchEvent(new PointerEvent('pointermove', { pointerId: 7, buttons: 4, clientX: 300, clientY: 150, bubbles: true }))
    svg.dispatchEvent(new PointerEvent('pointerup', { pointerId: 7, button: 1, clientX: 300, clientY: 150, bubbles: true }))
    expect(viewBox(svg)).toEqual([260, 145, 400, 200])
  })

  it('removes listeners and restores the original SVG on destroy', () => {
    const { svg, controller, onViewChange } = setup()
    controller.zoomIn()
    controller.destroy()
    expect(svg.getAttribute('viewBox')).toBe('10 20 800 400')
    expect(svg.hasAttribute('data-ow-viewport-active')).toBe(false)

    const calls = onViewChange.mock.calls.length
    svg.dispatchEvent(new KeyboardEvent('keydown', { key: '+', bubbles: true }))
    expect(onViewChange).toHaveBeenCalledTimes(calls)
  })

  it('rejects unusable SVG and zoom configuration', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    expect(() => mountSvgViewport(svg)).toThrow(/valid viewBox/)
    svg.setAttribute('viewBox', '0 0 100 100')
    expect(() => mountSvgViewport(svg, { minZoom: 0 })).toThrow(/zoom limits/)
    expect(() => mountSvgViewport(svg, { minZoom: 2 })).toThrow(/zoom limits/)
    expect(() => mountSvgViewport(svg, { maxZoom: 0.5 })).toThrow(/zoom limits/)
    expect(() => mountSvgViewport(svg, { zoomStep: 1 })).toThrow(/zoom limits/)
  })
})
