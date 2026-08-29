# Static export reliability

Orbweaver uses one validated graph, layout, and SVG rendering pipeline for all
export formats. Static exports do not reconstruct meaning from pixels or accept
authored coordinates. SVG is the semantic static artifact; PNG is a faithful
raster projection with a companion manifest and alt text.

## Guarantee matrix

| Guarantee | Portable HTML | SVG artifact | PNG artifact |
| --- | --- | --- | --- |
| Opens without a server | Yes | Yes | Yes |
| Scales without quality loss | Yes | Yes | No |
| Accessible title and description | Full document and SVG | Embedded in SVG | Returned as `altText` |
| Stable entity and relationship identity | Embedded | Embedded | Companion manifest only |
| Normalized semantic graph | Embedded manifest | Embedded manifest | Not embedded |
| Selection and connected emphasis | Built in | Requires a host controller | None |
| Semantic inspector | Built in | Requires a host inspector | None |
| Theme, lens, detail, path, comparison, and legend treatment | Preserved | Preserved | Preserved as pixels |
| Provenance | Inspectable manifest | Embedded manifest | Companion manifest |

Static SVG intentionally contains no executable runtime. A host can mount
`mountSvgInteraction` and its own inspector because semantic identity survives
as `data-node-id`, `data-edge-id`, and `data-group-id`. Portable HTML is the
supported choice when interaction must travel with the file.

PNG contains no recoverable semantic identity or built-in accessibility. Keep
the returned manifest beside the image and use `altText` wherever the target
platform supports alternative text.

## SVG artifacts

```ts
import { renderSvgArtifact } from '@semanticintent/orbweaver'

const artifact = await renderSvgArtifact(graph, {
  render: {
    theme: darkTheme,
    includeLegend: true,
    frame: { version: '1.2', renderer: 'Architecture review' },
  },
  provenance: {
    generatedAt: '2026-08-29T18:00:00Z',
    source: { file: 'architecture.rcl' },
  },
})

await writeFile('architecture.svg', artifact.data)
```

`renderSvgArtifact` produces fixed intrinsic dimensions by default, an XML
declaration, accessible title and description, stable semantic selectors, and
an `orbweaver-svg` version 1 manifest containing the normalized graph. The
function is deterministic and does not read the clock or write a file.

Use the lower-level `renderGraph` or `renderSvg` functions when a host only
needs inline SVG markup and does not need the static-artifact contract.

## PNG artifacts

In a browser, Orbweaver uses native SVG, image, and canvas APIs without adding a
rasterization dependency:

```ts
import { renderPngArtifact } from '@semanticintent/orbweaver'

const artifact = await renderPngArtifact(graph, {
  scale: 2,
  render: { theme: darkTheme, includeLegend: true },
})

const url = URL.createObjectURL(new Blob([artifact.data], { type: artifact.mimeType }))
```

`scale` must be greater than zero and no greater than four. Output is also
bounded to 64 million pixels to prevent accidental canvas exhaustion.

Node.js does not provide a standard PNG encoder. Pass a small adapter around
the rasterizer already approved by the host application instead of forcing one
into Orbweaver core:

```ts
const artifact = await renderPngArtifact(graph, {
  rasterizer: async ({ svg, width, height, scale }) => {
    return approvedRasterizer(svg, { width, height, scale })
  },
})
```

The adapter receives the exact versioned SVG artifact. It must return a
non-empty `Uint8Array`; failures and invalid output are reported as
`ArtifactExportError`.

## Versioning and trust

`svgArtifactVersion` and `pngArtifactVersion` expose the current manifest
versions (`1`). Static export validates structure but cannot establish whether
the graph is factually correct or human accepted. Hosts using `GraphProposal`
must complete their own acceptance gate before export.
