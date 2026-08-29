# Portable HTML artifacts

Orbweaver portable HTML version 1 is a single offline document containing a
validated normalized graph, accessible SVG, semantic inspector, theme state,
provenance, and a dependency-free interaction runtime.

The artifact preserves the authored-meaning/derived-geometry boundary. Graph
data remains plain semantic JSON; the SVG remains a derived view; the embedded
runtime reads semantic identity rather than reconstructing meaning from paths
or coordinates.

## Export API

```ts
import { renderHtmlArtifact } from '@semanticintent/orbweaver'

const html = await renderHtmlArtifact(graph, {
  theme: 'dark',
  allowThemeSwitch: true,
  provenance: {
    renderer: 'Architecture review pipeline',
    generatedAt: '2026-08-29T14:30:00Z',
    source: { file: 'architecture.rcl' },
  },
})
```

The function validates, normalizes, and lays out the graph before producing
HTML. It does not write a file or observe the clock. Output is deterministic
for the same graph and options; include `generatedAt` only when the caller wants
that explicit provenance value.

## Command line

```sh
orbweaver-html architecture.json \
  --output architecture.html \
  --theme dark
```

`--no-theme-switch` locks the initial theme. Without `--output`, the command
writes beside the input using an `.html` extension.

## Version 1 contents

- a normalized graph with stable relationship IDs and explicit direction;
- an accessible, responsive SVG with the selected render options;
- node, relationship, and group pointer/keyboard selection;
- connected-entity emphasis and background clearing;
- provenance and targeted annotation inspection;
- optional built-in dark/light switching;
- a strict inline content policy with no permitted network requests; and
- a machine-readable `orbweaver-portable-html` manifest.

The manifest is stored in a non-executable `application/json` script element.
Graph strings are escaped independently for visible HTML, SVG, and embedded
JSON contexts. The runtime creates inspector content through DOM text nodes; it
does not evaluate graph content or inject it as markup.

## Trust and acceptance boundary

`renderHtmlArtifact` accepts an ordinary `Graph`. It validates structural
correctness but cannot establish factual truth or human acceptance. A host
using `GraphProposal` must complete its explicit acceptance workflow before
passing the accepted graph to this API.

The artifact does not include WebMCP tools, model credentials, host callbacks,
source-navigation integrations, a freeform editor, or a collaboration service.
Its provenance is reviewable data supplied by the caller, not a cryptographic
signature.

## Portability guarantees

The version 1 file requires no package installation, server, external font,
stylesheet, image, or JavaScript resource after creation. It can be archived,
attached, and opened directly in a modern browser. Static SVG and PNG export
contracts are documented in [Static export reliability](export-reliability.md).
Print/PDF behavior, the supported-browser policy, compatibility migrations,
and automated multi-browser verification are completed in later Phase 10
slices.

The generated example gallery links to portable versions of every public
fixture. Run `npm run examples:generate`, then open any
`examples/generated/<showcase>.html` file directly or serve the gallery with
`npm run examples:serve`.
