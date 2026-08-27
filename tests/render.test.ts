import { describe, expect, it } from 'vitest'
import {
  darkTheme,
  layoutGraph,
  lightTheme,
  renderGraph,
  renderSvg,
  summarizeGraph,
  type Graph,
} from '../src/index.js'
import { fixtures } from './fixtures.js'

function fixture(index: number): Graph {
  const value = fixtures[index]
  if (value === undefined) throw new Error(`Fixture ${index} is missing.`)
  return value
}

describe('SVG renderer', () => {
  it('renders accessible, semantic SVG structure', async () => {
    const graph = fixture(1)
    const svg = await renderGraph(graph)

    expect(svg).toMatch(/^<svg /)
    expect(svg).toContain('role="img"')
    expect(svg).toContain('<title id="ow-decision-flow-title">Decision flow</title>')
    expect(svg).toContain('<desc id="ow-decision-flow-description">')
    expect(svg).toContain('class="ow-summary"')
    expect(svg).toContain('class="ow-nodes" role="list"')
    expect(svg).toContain('data-node-type="decision"')
    expect(svg).toContain('tabindex="0" role="listitem"')
    expect(svg).toContain('marker-end="url(#ow-decision-flow-arrow-end)"')
    expect(svg).toContain('class="ow-edge-label"')
    expect(svg).toContain('class="ow-edge-hit"')
    expect(svg).toContain('stroke-width:16')
    expect(svg).toContain('pointer-events:stroke')
    expect(svg).toContain('fill:var(--ow-accent-soft);stroke:var(--ow-accent);stroke-width:2.5')
    expect(svg).toContain('drop-shadow(0 0 7px var(--ow-accent))')
    expect(svg).toContain('.ow-has-selection [data-muted]{opacity:.12}')
    expect(svg.indexOf('[data-node-status="healthy"]')).toBeLessThan(svg.indexOf('.ow-node[data-related]'))
  })

  it('renders groups and semantic node surfaces', async () => {
    const architecture = await renderGraph(fixture(3), { render: { theme: darkTheme } })
    const dependency = await renderGraph(fixture(2))
    expect(architecture).toContain('data-theme="orbweaver-dark"')
    expect(architecture).toContain('data-group-id="application"')
    expect(dependency).toContain('data-node-type="database"')
    expect(dependency).toContain('data-node-status="critical"')
  })

  it('escapes untrusted graph content', async () => {
    const graph: Graph = {
      id: 'unsafe',
      title: '<script>alert("title")</script>',
      nodes: [
        { id: 'a', label: '<img src=x onerror=alert(1)>' },
        { id: 'b', label: 'Safe' },
      ],
      edges: [{ from: 'a', to: 'b', label: '<script>edge</script>' }],
    }
    const svg = await renderGraph(graph)
    expect(svg).not.toContain('<script>')
    expect(svg).not.toContain('<img')
    expect(svg).toContain('&lt;script&gt;')
    expect(svg).toContain('&lt;img')
  })

  it('supports fixed-size output and omitted summary metadata', async () => {
    const scene = await layoutGraph(fixture(0))
    const svg = renderSvg(scene, { responsive: false, includeSummary: false, theme: lightTheme })
    expect(svg).toContain(`width="${scene.width}" height="${scene.height}"`)
    expect(svg).not.toContain('class="ow-summary"')
  })

  it('renders an optional deterministic artifact frame outside scene geometry', async () => {
    const scene = await layoutGraph(fixture(0))
    const svg = renderSvg(scene, {
      responsive: false,
      frame: {
        version: '1.4',
        asOf: '2026-08-27',
        renderer: 'Orbweaver 0.2.0-alpha.1',
      },
    })

    expect(svg).toContain(`viewBox="0 0 ${scene.width} ${scene.height + 132}"`)
    expect(svg).toContain(`width="${scene.width}" height="${scene.height + 132}"`)
    expect(svg).toContain('class="ow-frame-title"')
    expect(svg).not.toContain('class="ow-frame-description"')
    expect(svg).toContain('class="ow-frame-meta"')
    expect(svg).toContain('Version 1.4 · As of 2026-08-27 · Orbweaver 0.2.0-alpha.1')
    expect(svg).toContain(`class="ow-scene" transform="translate(0 88)"`)
    expect(svg).toContain('&quot;asOf&quot;:&quot;2026-08-27&quot;')
    expect(svg).not.toContain('Generated 2026-')
  })

  it('escapes visible and machine-readable artifact metadata', async () => {
    const scene = await layoutGraph(fixture(0))
    const svg = renderSvg(scene, {
      frame: {
        title: '<script>frame</script>',
        version: '1 & 2',
      },
    })

    expect(svg).not.toContain('<script>')
    expect(svg).toContain('&lt;script&gt;frame&lt;/script&gt;')
    expect(svg).toContain('Version 1 &amp; 2')
  })
})

describe('summarizeGraph', () => {
  it('produces a semantic textual representation', () => {
    const summary = summarizeGraph(fixture(0))
    expect(summary).toContain('Basic flow')
    expect(summary).toContain('3 nodes and 2 relationships')
    expect(summary).toContain('Author flow Compiler')
    expect(summary).toContain('Compiler flow Artifact')
  })
})
