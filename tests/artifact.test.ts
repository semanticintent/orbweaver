// @vitest-environment happy-dom

import { afterEach, describe, expect, it } from 'vitest'
import {
  GraphValidationError,
  portableHtmlArtifactVersion,
  renderHtmlArtifact,
  type Graph,
  type PortableHtmlArtifactManifest,
} from '../src/index.js'

const graph: Graph = {
  id: 'portable-commerce',
  title: 'Portable commerce architecture',
  description: 'A reviewable system artifact that works without a server.',
  groups: [{ id: 'services', label: 'Services' }],
  nodes: [
    { id: 'checkout', type: 'process', label: 'Checkout', group: 'services', source: { file: 'commerce.rcl', line: 24 } },
    { id: 'orders', type: 'database', label: 'Order store', group: 'services', status: 'healthy' },
  ],
  edges: [{ id: 'persist', from: 'checkout', to: 'orders', type: 'data', label: 'Persist' }],
  annotations: [{ id: 'control', target: { kind: 'edge', id: 'persist' }, type: 'evidence', label: 'Control evidence', body: 'Every write carries an audit identifier.' }],
}

function manifest(html: string): PortableHtmlArtifactManifest {
  const value = html.match(/<script type="application\/json" id="ow-artifact-manifest">([^<]+)<\/script>/)?.[1]
  if (value === undefined) throw new Error('Portable artifact manifest is missing.')
  return JSON.parse(value) as PortableHtmlArtifactManifest
}

async function mountArtifact(html: string): Promise<void> {
  const body = html.match(/<body>([\s\S]+)<\/body>/)?.[1]
  const runtime = html.match(/<script>([\s\S]+)<\/script><\/body>/)?.[1]
  const svgSource = body?.match(/<svg[\s\S]+<\/svg>/)?.[0]
  if (body === undefined || runtime === undefined || svgSource === undefined) throw new Error('Portable artifact body, SVG, or runtime is missing.')
  document.body.innerHTML = body.replace(svgSource, '<span id="ow-svg-test-placeholder"></span>')
  const parsedSvg = new DOMParser().parseFromString(svgSource, 'image/svg+xml')
  document.getElementById('ow-svg-test-placeholder')?.replaceWith(document.importNode(parsedSvg.documentElement, true))
  window.eval(runtime)
}

afterEach(() => {
  document.head.innerHTML = ''
  document.body.innerHTML = ''
})

describe('portable HTML artifact', () => {
  it('renders a deterministic, versioned, self-contained document', async () => {
    const options = { theme: 'dark' as const, provenance: { renderer: 'Orbweaver test', generatedAt: '2026-08-29T12:00:00Z' } }
    const first = await renderHtmlArtifact(graph, options)
    const second = await renderHtmlArtifact(graph, options)
    expect(first).toBe(second)
    expect(first).toMatch(/^<!doctype html>/)
    expect(first).toContain(`Portable semantic artifact · version ${portableHtmlArtifactVersion}`)
    expect(first).toContain("default-src 'none'")
    expect(first).not.toContain('<link ')
    expect(first).not.toMatch(/<script[^>]+src=/)
    expect(first).not.toContain('eval(')
    expect(first).not.toContain('fetch(')
    expect(first).toContain('role="img"')
    expect(first).toContain('Semantic inspector')

    const embedded = manifest(first)
    expect(embedded).toMatchObject({
      format: 'orbweaver-portable-html',
      version: '1',
      theme: 'dark',
      allowThemeSwitch: true,
      provenance: options.provenance,
    })
    expect(embedded.graph.edges[0]).toMatchObject({ id: 'persist', direction: 'forward' })
    expect(embedded.summary).toContain('2 nodes and 1 relationship')
    expect(embedded.themes.dark['--ow-canvas']).toBe('#080c14')
    expect(embedded.themes.light['--ow-canvas']).toBe('#f7f9fc')
  })

  it('provides offline selection, inspection, clearing, and theme switching', async () => {
    await mountArtifact(await renderHtmlArtifact(graph))
    const edgeHit = document.querySelector('[data-edge-id="persist"] .ow-edge-hit')
    edgeHit?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(document.querySelector('[data-edge-id="persist"]')?.hasAttribute('data-selected')).toBe(true)
    expect(document.querySelector('[data-node-id="checkout"]')?.hasAttribute('data-related')).toBe(true)
    expect(document.getElementById('ow-inspector-content')?.textContent).toContain('Persist')
    expect(document.getElementById('ow-inspector-content')?.textContent).toContain('Every write carries an audit identifier.')

    const light = document.querySelector<HTMLButtonElement>('[data-theme-choice="light"]')
    light?.click()
    const svg = document.querySelector<SVGSVGElement>('#ow-diagram svg')
    expect(light?.getAttribute('aria-pressed')).toBe('true')
    expect(svg?.getAttribute('data-theme')).toBe('orbweaver-light')
    expect(svg?.style.getPropertyValue('--ow-canvas')).toBe('#f7f9fc')

    document.getElementById('ow-diagram')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(document.querySelector('[data-selected]')).toBeNull()
    expect(document.getElementById('ow-inspector-content')?.textContent).toContain('Select an entity')
  })

  it('keeps hostile graph text inert in visible content and embedded JSON', async () => {
    const unsafe: Graph = {
      id: 'unsafe-artifact',
      title: '</script><script>globalThis.compromised=true</script>',
      nodes: [{ id: 'safe', label: '<img src=x onerror=alert(1)>' }],
      edges: [],
    }
    const html = await renderHtmlArtifact(unsafe)
    expect(html).not.toContain('</script><script>globalThis.compromised')
    expect(html).not.toContain('<img src=x')
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;')
    expect(manifest(html).graph.title).toBe(unsafe.title)
  })

  it('can lock theme controls and preserves graph validation', async () => {
    const html = await renderHtmlArtifact(graph, { theme: 'light', allowThemeSwitch: false })
    expect(html).not.toContain('<button type="button" data-theme-choice')
    expect(manifest(html)).toMatchObject({ theme: 'light', allowThemeSwitch: false })
    await expect(renderHtmlArtifact({ id: 'invalid', nodes: [{ id: 'a', label: 'A' }], edges: [{ from: 'a', to: 'missing' }] }))
      .rejects.toBeInstanceOf(GraphValidationError)
  })
})
