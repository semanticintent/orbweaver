import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { darkTheme, layoutGraph, lightTheme, renderSvg } from '../dist/index.js'

const here = dirname(fileURLToPath(import.meta.url))
const output = join(here, 'generated')
mkdirSync(output, { recursive: true })

const dependencyMap = {
  id: 'commerce-platform',
  title: 'Commerce platform dependencies',
  description: 'A source-aware service dependency map for a commerce platform.',
  groups: [
    { id: 'experience', label: 'Experience layer' },
    { id: 'services', label: 'Service layer' },
    { id: 'data', label: 'Data and events' },
    { id: 'external', label: 'External systems' },
  ],
  nodes: [
    { id: 'storefront', type: 'service', label: 'Storefront', group: 'experience', status: 'healthy' },
    { id: 'admin', type: 'service', label: 'Operations console', group: 'experience' },
    { id: 'gateway', type: 'service', label: 'API gateway', group: 'services' },
    { id: 'checkout', type: 'process', label: 'Checkout orchestration', group: 'services' },
    { id: 'inventory', type: 'service', label: 'Inventory', group: 'services', status: 'warning' },
    { id: 'orders', type: 'database', label: 'Order store', group: 'data' },
    { id: 'events', type: 'queue', label: 'Commerce events', group: 'data' },
    { id: 'payment', type: 'external', label: 'Payment provider', group: 'external', status: 'critical' },
  ],
  edges: [
    { from: 'storefront', to: 'gateway', type: 'request' },
    { from: 'admin', to: 'gateway', type: 'request' },
    { from: 'gateway', to: 'checkout', type: 'flow' },
    { from: 'checkout', to: 'inventory', type: 'dependency', label: 'Reserve' },
    { from: 'checkout', to: 'orders', type: 'data', label: 'Persist' },
    { from: 'checkout', to: 'events', type: 'event', label: 'Publish' },
    { from: 'checkout', to: 'payment', type: 'error', label: 'Authorize' },
  ],
}

const scene = await layoutGraph(dependencyMap, {
  direction: 'LR',
  spacing: 48,
  layerSpacing: 88,
  padding: 32,
})

for (const theme of [lightTheme, darkTheme]) {
  const svg = renderSvg(scene, { theme, responsive: false })
  writeFileSync(join(output, `commerce-platform-${theme.id.endsWith('dark') ? 'dark' : 'light'}.svg`), svg)
}

const interactiveSvg = renderSvg(scene, { theme: darkTheme })
const graphJson = JSON.stringify(scene.graph).replaceAll('<', '\\u003c')
const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Orbweaver interaction showcase</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; background: #080c14; color: #f1f5f9; font-family: Inter, system-ui, sans-serif; }
    main { min-height: 100vh; display: grid; grid-template-columns: minmax(0, 1fr) 320px; }
    .canvas { min-width: 0; padding: 28px; display: grid; place-items: center; }
    .canvas svg { max-height: calc(100vh - 56px); }
    aside { border-left: 1px solid #29364b; padding: 28px 24px; background: #0d1422; }
    .eyebrow { margin: 0 0 10px; color: #67e8f9; font: 600 11px/1.4 'IBM Plex Mono', monospace; letter-spacing: 1.4px; text-transform: uppercase; }
    h1 { margin: 0 0 10px; font-size: 20px; }
    .hint { color: #8fa0b8; font-size: 14px; line-height: 1.6; }
    dl { display: grid; grid-template-columns: 78px 1fr; gap: 10px; margin-top: 26px; font-size: 13px; }
    dt { color: #8fa0b8; } dd { margin: 0; overflow-wrap: anywhere; }
    @media (max-width: 850px) { main { grid-template-columns: 1fr; } aside { border-left: 0; border-top: 1px solid #29364b; } }
  </style>
</head>
<body>
  <main>
    <div class="canvas">${interactiveSvg}</div>
    <aside aria-live="polite">
      <p class="eyebrow">Orbweaver inspector</p>
      <h1 id="inspect-title">Select an entity</h1>
      <p class="hint" id="inspect-hint">Click a node, relationship, or group. Nodes also support Enter, Space, and Escape.</p>
      <dl id="inspect-fields"></dl>
    </aside>
  </main>
  <script type="application/json" id="orbweaver-graph">${graphJson}</script>
  <script type="module">
    import { mountSvgInteraction } from '../../dist/index.js'
    const svg = document.querySelector('.orbweaver')
    const graph = JSON.parse(document.querySelector('#orbweaver-graph').textContent)
    const title = document.querySelector('#inspect-title')
    const hint = document.querySelector('#inspect-hint')
    const fields = document.querySelector('#inspect-fields')
    mountSvgInteraction(svg, graph, {
      onSelectionChange(inspection) {
        if (!inspection) {
          title.textContent = 'Select an entity'
          hint.hidden = false
          fields.replaceChildren()
          return
        }
        title.textContent = inspection.label || inspection.id
        hint.hidden = true
        const values = {
          Kind: inspection.kind,
          Type: inspection.type,
          From: inspection.from,
          To: inspection.to,
          Neighbors: inspection.relationships?.neighborNodeIds?.join(', '),
          Members: inspection.memberNodeIds?.join(', '),
          Source: inspection.source?.file,
        }
        fields.replaceChildren()
        for (const [key, value] of Object.entries(values)) {
          if (!value) continue
          const term = document.createElement('dt')
          const detail = document.createElement('dd')
          term.textContent = key
          detail.textContent = value
          fields.append(term, detail)
        }
      },
    })
  </script>
</body>
</html>`
writeFileSync(join(output, 'commerce-platform-interactive.html'), html)
