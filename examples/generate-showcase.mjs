import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { darkTheme, layoutGraph, lightTheme, renderSvg, summarizeGraph } from '../dist/index.js'
import { showcases } from './showcases.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const output = join(here, 'generated')
mkdirSync(output, { recursive: true })

function escapeHtml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
}

const rendered = []
for (const showcase of showcases) {
  const scene = await layoutGraph(showcase.graph, showcase.layout)
  const light = renderSvg(scene, { theme: lightTheme, responsive: false })
  const dark = renderSvg(scene, { theme: darkTheme, responsive: false })
  writeFileSync(join(output, `${showcase.slug}-light.svg`), light)
  writeFileSync(join(output, `${showcase.slug}-dark.svg`), dark)
  rendered.push({ ...showcase, scene, light, dark, summary: summarizeGraph(scene.graph) })
}

const cards = rendered.map((showcase, index) => {
  const graphJson = JSON.stringify(showcase.scene.graph).replaceAll('<', '\\u003c')
  return `<article class="showcase" id="${showcase.slug}">
    <header class="showcase-header">
      <div><p class="eyebrow">0${index + 1} / ${escapeHtml(showcase.kicker)}</p><h2>${escapeHtml(showcase.graph.title)}</h2><p>${escapeHtml(showcase.description)}</p></div>
      <div class="actions"><a href="${showcase.slug}-dark.svg" download>Dark SVG</a><a href="${showcase.slug}-light.svg" download>Light SVG</a></div>
    </header>
    <div class="diagram" data-showcase="${showcase.slug}">${showcase.dark}</div>
    <div class="details-row">
      <details><summary>Semantic graph</summary><pre>${escapeHtml(JSON.stringify(showcase.graph, null, 2))}</pre></details>
      <details><summary>Accessible summary</summary><p>${escapeHtml(showcase.summary)}</p></details>
    </div>
    <script type="application/json" data-graph="${showcase.slug}">${graphJson}</script>
  </article>`
}).join('\n')

const html = `<!doctype html><html lang="en"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Orbweaver semantic visualization showcase">
  <title>Orbweaver — Semantic visual structures</title>
  <style>
    :root{color-scheme:dark;--bg:#060912;--panel:#0b111d;--text:#f1f5f9;--muted:#8fa0b8;--line:#263249;--accent:#67e8f9}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,sans-serif}a{color:inherit}.hero{max-width:1180px;margin:auto;padding:88px 28px 64px}.brand{color:var(--accent);font:600 12px/1.4 'IBM Plex Mono',monospace;letter-spacing:2px;text-transform:uppercase}h1{max-width:850px;margin:18px 0 24px;font-size:clamp(42px,7vw,82px);line-height:.98;letter-spacing:-.055em}.lede{max-width:690px;color:var(--muted);font-size:19px;line-height:1.7}.principle{display:inline-block;margin-top:26px;padding:10px 14px;border:1px solid var(--line);border-radius:8px;color:var(--accent);font:500 12px/1.4 'IBM Plex Mono',monospace}nav{position:sticky;top:0;z-index:20;border-block:1px solid var(--line);background:rgba(6,9,18,.88);backdrop-filter:blur(16px)}nav div{max-width:1180px;margin:auto;padding:13px 28px;display:flex;gap:22px;overflow:auto}nav a{color:var(--muted);font:500 11px/1.4 'IBM Plex Mono',monospace;letter-spacing:.7px;text-decoration:none;text-transform:uppercase;white-space:nowrap}nav a:hover{color:var(--accent)}main{max-width:1320px;margin:auto;padding:56px 28px 120px}.showcase{margin-bottom:88px;border:1px solid var(--line);border-radius:20px;overflow:hidden;background:var(--panel);box-shadow:0 30px 90px rgba(0,0,0,.28)}.showcase-header{padding:28px 30px;display:flex;justify-content:space-between;align-items:end;gap:30px;border-bottom:1px solid var(--line)}.eyebrow{margin:0 0 9px;color:var(--accent);font:600 10px/1.4 'IBM Plex Mono',monospace;letter-spacing:1.4px;text-transform:uppercase}h2{margin:0 0 8px;font-size:24px;letter-spacing:-.02em}.showcase-header p:last-child{max-width:680px;margin:0;color:var(--muted);line-height:1.6}.actions{display:flex;gap:8px;flex-shrink:0}.actions a{padding:8px 11px;border:1px solid var(--line);border-radius:7px;color:var(--muted);font:500 10px/1.4 'IBM Plex Mono',monospace;text-decoration:none;text-transform:uppercase}.actions a:hover{color:var(--accent);border-color:var(--accent)}.diagram{min-height:360px;padding:30px;display:grid;place-items:center;overflow:auto;background:#080c14}.diagram svg{min-width:680px;max-height:660px}.details-row{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid var(--line)}details{padding:18px 22px;min-width:0}details+details{border-left:1px solid var(--line)}summary{cursor:pointer;color:var(--muted);font:500 11px/1.4 'IBM Plex Mono',monospace;text-transform:uppercase}details p{color:var(--muted);line-height:1.7}pre{max-height:360px;overflow:auto;color:#c2ccda;font:12px/1.65 'IBM Plex Mono',monospace;white-space:pre-wrap}.inspector{position:fixed;z-index:30;right:22px;bottom:22px;width:min(340px,calc(100vw - 44px));padding:20px;border:1px solid #40506a;border-radius:14px;background:rgba(13,20,34,.96);box-shadow:0 24px 70px rgba(0,0,0,.5);backdrop-filter:blur(18px)}.inspector h3{margin:5px 0 8px;font-size:18px}.inspector .hint{margin:0;color:var(--muted);font-size:13px;line-height:1.55}dl{display:grid;grid-template-columns:76px 1fr;gap:8px;margin:16px 0 0;font-size:12px}dt{color:var(--muted)}dd{margin:0;overflow-wrap:anywhere}@media(max-width:760px){.showcase-header{align-items:start;flex-direction:column}.details-row{grid-template-columns:1fr}.details-row details+details{border-left:0;border-top:1px solid var(--line)}.diagram{padding:18px}.hero{padding-top:58px}}
  </style></head><body>
  <header class="hero"><p class="brand">Orbweaver / showcase</p><h1>Relationships become structures you can reason through.</h1><p class="lede">Five semantic graphs. One layout and rendering pipeline. No manual coordinates. Select any visual entity to inspect the meaning and provenance that survived into the artifact.</p><span class="principle">Authors declare meaning. Orbweaver owns geometry.</span></header>
  <nav><div>${rendered.map((item) => `<a href="#${item.slug}">${escapeHtml(item.kicker)}</a>`).join('')}</div></nav>
  <main>${cards}</main>
  <aside class="inspector" aria-live="polite"><p class="eyebrow">Semantic inspector</p><h3 id="inspect-title">Select an entity</h3><p class="hint" id="inspect-hint">Click a node, edge, or group. Keyboard users can select focused nodes with Enter or Space.</p><dl id="inspect-fields"></dl></aside>
  <script type="module" src="orbweaver-gallery.js"></script></body></html>`

writeFileSync(join(output, 'index.html'), html)
