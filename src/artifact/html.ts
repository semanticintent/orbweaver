import { summarizeGraph } from '../accessibility/summarize.js'
import { layoutGraph } from '../layout/layout.js'
import type { Graph } from '../model/types.js'
import { renderSvg } from '../render/svg.js'
import { darkTheme, lightTheme } from '../theme/defaults.js'
import type { OrbweaverTheme } from '../theme/types.js'
import {
  portableHtmlArtifactVersion,
  type HtmlArtifactOptions,
  type PortableArtifactTheme,
  type PortableHtmlArtifactManifest,
} from './types.js'

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;')
}

function scriptJson(value: unknown): string {
  return JSON.stringify(value).replaceAll('<', '\\u003c').replaceAll('\u2028', '\\u2028').replaceAll('\u2029', '\\u2029')
}

function themeVariables(theme: OrbweaverTheme): Record<string, string> {
  return {
    '--ow-canvas': theme.colors.canvas,
    '--ow-surface': theme.colors.surface,
    '--ow-surface-raised': theme.colors.surfaceRaised,
    '--ow-surface-muted': theme.colors.surfaceMuted,
    '--ow-text': theme.colors.text,
    '--ow-text-muted': theme.colors.textMuted,
    '--ow-border': theme.colors.border,
    '--ow-border-strong': theme.colors.borderStrong,
    '--ow-edge': theme.colors.edge,
    '--ow-edge-label': theme.colors.edgeLabel,
    '--ow-accent': theme.colors.accent,
    '--ow-accent-soft': theme.colors.accentSoft,
    '--ow-focus': theme.colors.focus,
    '--ow-selection': theme.colors.selection,
    '--ow-success': theme.colors.success,
    '--ow-warning': theme.colors.warning,
    '--ow-danger': theme.colors.danger,
    '--ow-shadow': theme.colors.shadow,
  }
}

const artifactStyles = `
:root{color-scheme:dark;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#060b10;color:#e5eef1}
*{box-sizing:border-box}body{margin:0;min-width:320px;background:radial-gradient(circle at 20% 0,rgba(103,232,249,.08),transparent 32rem),#060b10;color:#e5eef1}
button{font:inherit}.ow-shell{min-height:100vh;display:grid;grid-template-rows:auto 1fr auto}.ow-header{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;padding:24px 28px;border-bottom:1px solid #1c2a31;background:rgba(6,11,16,.94)}
.ow-heading{max-width:860px}.ow-kicker{margin:0 0 7px;color:#67e8f9;font:700 10px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.16em;text-transform:uppercase}.ow-heading h1{margin:0;color:#f3f7f8;font-size:clamp(21px,3vw,34px);line-height:1.1}.ow-heading p:last-child{margin:9px 0 0;color:#849aa1;font-size:13px;line-height:1.55}
.ow-theme-controls{display:flex;gap:5px;padding:4px;border:1px solid #223139;border-radius:8px;background:#0b1419}.ow-theme-controls button{padding:7px 10px;border:0;border-radius:5px;background:transparent;color:#789097;font:700 9px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}.ow-theme-controls button[aria-pressed=true]{background:#173038;color:#67e8f9}.ow-theme-controls button:focus-visible{outline:2px solid #fbbf24;outline-offset:2px}
.ow-workspace{min-height:0;display:grid;grid-template-columns:minmax(0,1fr) 300px}.ow-diagram{min-width:0;overflow:auto;padding:24px;background:#081016}.ow-diagram svg{display:block;width:100%;min-width:720px;height:auto;border:1px solid #1d2b32;border-radius:12px;box-shadow:0 22px 70px rgba(0,0,0,.28)}
.ow-inspector{padding:22px;border-left:1px solid #1c2a31;background:#091116;overflow:auto}.ow-inspector-label{margin:0 0 22px;color:#60777e;font:700 9px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.14em;text-transform:uppercase}.ow-inspector h2{margin:0;color:#e8f0f2;font-size:17px}.ow-inspector-intro,.ow-inspector-description{color:#82969c;font-size:11px;line-height:1.6}.ow-identity{margin:6px 0 18px;color:#67e8f9;font:700 8px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;text-transform:uppercase}.ow-fields{display:grid;gap:0;margin:18px 0}.ow-fields div{display:grid;grid-template-columns:82px 1fr;gap:10px;padding:8px 0;border-top:1px solid #17242a}.ow-fields dt{color:#5f757c;font:700 8px ui-monospace,SFMono-Regular,Menlo,monospace;text-transform:uppercase}.ow-fields dd{margin:0;color:#b8c7cb;font-size:10px;overflow-wrap:anywhere}.ow-annotation{margin-top:10px;padding:11px;border:1px solid #24414a;border-radius:7px;background:#0d1c21}.ow-annotation b{display:block;color:#67e8f9;font:700 8px ui-monospace,SFMono-Regular,Menlo,monospace;text-transform:uppercase}.ow-annotation p{margin:6px 0 0;color:#98aaaf;font-size:10px;line-height:1.5}
.ow-footer{display:flex;justify-content:space-between;gap:20px;padding:11px 20px;border-top:1px solid #1c2a31;background:#070d11;color:#587078;font:8px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.05em;text-transform:uppercase}.ow-footer b{color:#93a8ae}
@media(max-width:800px){.ow-header{flex-direction:column;padding:20px}.ow-workspace{grid-template-columns:1fr}.ow-inspector{border-top:1px solid #1c2a31;border-left:0}.ow-diagram{padding:12px}.ow-footer{flex-direction:column}}
@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;transition:none!important}}
`

const artifactRuntime = `
(()=>{'use strict';
const manifestElement=document.getElementById('ow-artifact-manifest');
const diagram=document.getElementById('ow-diagram');
const inspector=document.getElementById('ow-inspector-content');
if(!manifestElement||!diagram||!inspector)return;
const manifest=JSON.parse(manifestElement.textContent||'{}');
const graph=manifest.graph;
const attr={node:'data-node-id',edge:'data-edge-id',group:'data-group-id'};
const entitySelector='[data-node-id],[data-edge-id],[data-group-id]';
const annotations=(ref)=>(graph.annotations||[]).filter((item)=>item.target&&item.target.kind===ref.kind&&item.target.id===ref.id);
const refFor=(element)=>{for(const kind of ['node','edge','group']){const id=element.getAttribute(attr[kind]);if(id!==null)return{kind,id};}};
const entityFor=(ref)=>ref.kind==='node'?graph.nodes.find((item)=>item.id===ref.id):ref.kind==='edge'?graph.edges.find((item)=>item.id===ref.id):(graph.groups||[]).find((item)=>item.id===ref.id);
const add=(parent,name,text)=>{const element=document.createElement(name);element.textContent=String(text);parent.append(element);return element;};
const field=(list,label,value)=>{if(value===undefined||value===null||value==='')return;const row=document.createElement('div');add(row,'dt',label);add(row,'dd',Array.isArray(value)?value.join(', '):typeof value==='object'?JSON.stringify(value):value);list.append(row);};
const clearState=()=>{diagram.querySelector('svg')?.classList.remove('ow-has-selection');diagram.querySelectorAll('[data-selected],[data-related],[data-muted]').forEach((element)=>{element.removeAttribute('data-selected');element.removeAttribute('data-related');element.removeAttribute('data-muted');});};
const related=(ref)=>{const nodes=new Set(),edges=new Set(),groups=new Set();if(ref.kind==='node'){nodes.add(ref.id);graph.edges.forEach((edge)=>{if(edge.from===ref.id||edge.to===ref.id){edges.add(edge.id);nodes.add(edge.from);nodes.add(edge.to);}});}else if(ref.kind==='edge'){const edge=graph.edges.find((item)=>item.id===ref.id);if(edge){edges.add(edge.id);nodes.add(edge.from);nodes.add(edge.to);}}else{groups.add(ref.id);let changed=true;while(changed){changed=false;(graph.groups||[]).forEach((group)=>{if(group.parent&&groups.has(group.parent)&&!groups.has(group.id)){groups.add(group.id);changed=true;}});}graph.nodes.filter((node)=>node.group&&groups.has(node.group)).forEach((node)=>nodes.add(node.id));graph.edges.forEach((edge)=>{if(nodes.has(edge.from)||nodes.has(edge.to)){edges.add(edge.id);nodes.add(edge.from);nodes.add(edge.to);}});}graph.nodes.forEach((node)=>{if(!nodes.has(node.id))return;let groupId=node.group;while(groupId){groups.add(groupId);groupId=(graph.groups||[]).find((group)=>group.id===groupId)?.parent;}});return{nodes,edges,groups};};
const renderInspector=(ref)=>{const entity=entityFor(ref);if(!entity)return;inspector.replaceChildren();add(inspector,'h2',entity.label||entity.id);const identity=add(inspector,'p',ref.kind+' / '+ref.id);identity.className='ow-identity';if(entity.description){const description=add(inspector,'p',entity.description);description.className='ow-inspector-description';}const list=document.createElement('dl');list.className='ow-fields';field(list,'Type',entity.type);field(list,'Status',entity.status);field(list,'From',entity.from);field(list,'To',entity.to);field(list,'Value',entity.value);field(list,'Group',entity.group);field(list,'Source',entity.source&&entity.source.file);field(list,'Line',entity.source&&entity.source.line);field(list,'Metadata',entity.metadata);inspector.append(list);annotations(ref).forEach((item)=>{const card=document.createElement('article');card.className='ow-annotation';add(card,'b',(item.type||'note')+(item.severity&&item.severity!=='info'?' · '+item.severity:''));if(item.label)add(card,'strong',item.label);add(card,'p',item.body);inspector.append(card);});};
const select=(ref)=>{const entity=entityFor(ref);if(!entity)return;clearState();const svg=diagram.querySelector('svg');svg&&svg.classList.add('ow-has-selection');const sets=related(ref);diagram.querySelectorAll(entitySelector).forEach((element)=>{const current=refFor(element);if(!current)return;const selected=current.kind===ref.kind&&current.id===ref.id;const isRelated=sets[current.kind+'s'].has(current.id);element.toggleAttribute('data-selected',selected);element.toggleAttribute('data-related',!selected&&isRelated);element.toggleAttribute('data-muted',!selected&&!isRelated);});renderInspector(ref);};
const clear=()=>{clearState();inspector.replaceChildren();add(inspector,'h2','Select an entity');const intro=add(inspector,'p','Choose a node, relationship, or group to inspect its meaning, provenance, and annotations.');intro.className='ow-inspector-intro';};
diagram.addEventListener('click',(event)=>{const entity=event.target.closest&&event.target.closest(entitySelector);if(!entity||!diagram.contains(entity)){clear();return;}const ref=refFor(entity);if(ref)select(ref);});
diagram.addEventListener('keydown',(event)=>{if(event.key==='Escape'){clear();return;}if(event.key!=='Enter'&&event.key!==' ')return;const entity=event.target.closest&&event.target.closest(entitySelector);if(!entity)return;const ref=refFor(entity);if(!ref)return;event.preventDefault();select(ref);});
const themes=manifest.themes||{};const applyTheme=(name)=>{const svg=diagram.querySelector('svg');const values=themes[name];if(!svg||!values)return;Object.entries(values).forEach(([key,value])=>svg.style.setProperty(key,value));svg.setAttribute('data-theme','orbweaver-'+name);document.querySelectorAll('[data-theme-choice]').forEach((button)=>button.setAttribute('aria-pressed',String(button.getAttribute('data-theme-choice')===name)));};
document.querySelectorAll('[data-theme-choice]').forEach((button)=>button.addEventListener('click',()=>applyTheme(button.getAttribute('data-theme-choice'))));
clear();
})();`

export async function renderHtmlArtifact(graph: Graph, options: HtmlArtifactOptions = {}): Promise<string> {
  const themeName: PortableArtifactTheme = options.theme ?? 'dark'
  const theme = themeName === 'dark' ? darkTheme : lightTheme
  const scene = await layoutGraph(graph, options.layout)
  const svg = renderSvg(scene, { ...options.render, responsive: true, theme })
  const manifest: PortableHtmlArtifactManifest = {
    format: 'orbweaver-portable-html',
    version: portableHtmlArtifactVersion,
    graph: structuredClone(scene.graph),
    summary: summarizeGraph(scene.graph),
    theme: themeName,
    allowThemeSwitch: options.allowThemeSwitch ?? true,
    ...(options.provenance === undefined ? {} : { provenance: structuredClone(options.provenance) }),
    themes: { dark: themeVariables(darkTheme), light: themeVariables(lightTheme) },
  }
  const title = graph.title?.trim() || graph.id
  const description = graph.description?.trim() || manifest.summary
  const renderer = options.provenance?.renderer ?? 'Orbweaver'
  const generated = options.provenance?.generatedAt
  const themeControls = manifest.allowThemeSwitch ? `<div class="ow-theme-controls" aria-label="Diagram theme"><button type="button" data-theme-choice="dark" aria-pressed="${themeName === 'dark'}">Dark</button><button type="button" data-theme-choice="light" aria-pressed="${themeName === 'light'}">Light</button></div>` : ''
  const provenance = generated ?? `${scene.graph.nodes.length} nodes · ${scene.graph.edges.length} relationships`

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:"><title>${escapeHtml(title)} — Orbweaver artifact</title><style>${artifactStyles}</style></head>
<body><main class="ow-shell"><header class="ow-header"><div class="ow-heading"><p class="ow-kicker">Portable semantic artifact · version ${portableHtmlArtifactVersion}</p><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p></div>${themeControls}</header><div class="ow-workspace"><section id="ow-diagram" class="ow-diagram" aria-label="Interactive semantic diagram">${svg}</section><aside class="ow-inspector" aria-live="polite"><p class="ow-inspector-label">Semantic inspector</p><div id="ow-inspector-content"></div></aside></div><footer class="ow-footer"><span><b>${escapeHtml(renderer)}</b> · self-contained HTML</span><span>${escapeHtml(provenance)}</span></footer></main><script type="application/json" id="ow-artifact-manifest">${scriptJson(manifest)}</script><script>${artifactRuntime}</script></body></html>`
}
