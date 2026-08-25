import { mountSvgInteraction } from '../src/interaction/controller.js'

const title = document.querySelector<HTMLElement>('#inspect-title')
const hint = document.querySelector<HTMLElement>('#inspect-hint')
const fields = document.querySelector<HTMLDListElement>('#inspect-fields')

if (!title || !hint || !fields) {
  throw new Error('The gallery inspector markup is incomplete.')
}

function show(inspection: Parameters<Parameters<typeof mountSvgInteraction>[2]['onSelectionChange']>[0]) {
  fields.replaceChildren()

  if (!inspection) {
    title.textContent = 'Select an entity'
    hint.hidden = false
    return
  }

  title.textContent = inspection.label || inspection.id
  hint.hidden = true

  const values = {
    Kind: inspection.kind,
    Type: inspection.type,
    Status: inspection.status,
    From: inspection.from,
    To: inspection.to,
    Neighbors: inspection.relationships?.neighborNodeIds?.join(', '),
    Members: inspection.memberNodeIds?.join(', '),
    Source: inspection.source?.file,
    Line: inspection.source?.line,
  }

  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === '') continue
    const term = document.createElement('dt')
    const detail = document.createElement('dd')
    term.textContent = key
    detail.textContent = String(value)
    fields.append(term, detail)
  }
}

for (const panel of document.querySelectorAll<HTMLElement>('[data-showcase]')) {
  const slug = panel.dataset.showcase
  const graphData = document.querySelector<HTMLScriptElement>(`[data-graph="${slug}"]`)
  const svg = panel.querySelector<SVGSVGElement>('svg')

  if (!slug || !graphData || !svg) continue
  mountSvgInteraction(svg, JSON.parse(graphData.textContent ?? ''), { onSelectionChange: show })
}
