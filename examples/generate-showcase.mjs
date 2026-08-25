import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { darkTheme, lightTheme, renderGraph } from '../dist/index.js'

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

for (const theme of [lightTheme, darkTheme]) {
  const svg = await renderGraph(dependencyMap, {
    layout: { direction: 'LR', spacing: 48, layerSpacing: 88, padding: 32 },
    render: { theme, responsive: false },
  })
  writeFileSync(join(output, `commerce-platform-${theme.id.endsWith('dark') ? 'dark' : 'light'}.svg`), svg)
}
