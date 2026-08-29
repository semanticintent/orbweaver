# Contract compatibility

Orbweaver versions serialized contracts independently from the npm package. A
new prerelease can therefore read contract version `1` without pretending that
package numbers are data-schema versions.

## Contract registry

| Contract | Current version | Version location | Compatibility |
| --- | --- | --- | --- |
| Semantic graph | `1` | `GraphDocument.version` | Unversioned v0.1 graphs migrate losslessly |
| Positioned scene | `1` | `SceneDocument.version` | Unversioned v0.1 scenes migrate when structurally valid |
| Graph proposal | `1` | `GraphProposal.schemaVersion` | Strict |
| Portable HTML | `1` | Manifest `version` | Strict |
| SVG artifact | `1` | Manifest `version` | Strict |
| PNG companion | `1` | Manifest `version` | Strict |

`contractVersions` is the canonical runtime registry. `contractSchemaIds`
contains stable schema identities, and `contractJsonSchemas` exposes every
JSON Schema as ordinary data.

## Graph and scene documents

Graphs remain plain semantic inputs. Coordinates are not added merely to make
them versioned. Use a transport document when a graph is persisted or sent
across a compatibility boundary:

```ts
import {
  createGraphDocument,
  graphFromDocument,
  readGraphDocument,
} from '@semanticintent/orbweaver'

const document = createGraphDocument(graph)
// { format: 'orbweaver-graph', version: '1', graph: normalizedGraph }

const result = readGraphDocument(JSON.parse(source))
if (!result.compatible) {
  for (const diagnostic of result.diagnostics) {
    console.error(diagnostic.code, diagnostic.message, diagnostic.action)
  }
} else {
  const graph = graphFromDocument(result.document)
}
```

`createSceneDocument`, `readSceneDocument`, and `sceneFromDocument` provide the
same boundary for renderer-independent positioned scenes. Creation and reading
return detached data; callers never receive references retained by the input.

## Pre-1.0 migration policy

Orbweaver follows a conservative policy while the package remains pre-1.0:

1. Unversioned graphs and scenes produced by the v0.1 line are treated as
   contract version `1`, normalized, and returned with the warning
   `contract-version-assumed`.
2. The next write should use a `GraphDocument` or `SceneDocument`; migration is
   pure and does not modify the source value.
3. Proposal and artifact envelopes are never assigned a missing version. Their
   safety and portability guarantees depend on the declared envelope.
4. A future version is rejected with `contract-version-newer` and an explicit
   instruction to upgrade Orbweaver.
5. An older unsupported version is rejected rather than guessed. Migration
   must be performed by a release that understands both shapes.
6. Lossy migrations are not automatic. A future lossy migration must expose
   its changes and require an explicit caller decision.

Contract version `1` changes only when a serialized typed field changes. New
library functions, renderer behavior, themes, or values stored inside the
open-ended `metadata` records do not by themselves change a contract version.

## Diagnostics

Compatibility diagnostics contain stable `code`, `severity`, `message`,
`action`, and optional JSON `path` fields. They are safe to display directly in
a CLI, UI, WebMCP result, or build log.

`ArtifactExportError` likewise exposes `code` and `action`. Examples include
`png-scale-invalid`, `png-pixel-limit-exceeded`,
`png-browser-apis-unavailable`, `png-svg-decode-failed`, and
`png-output-empty`.

## Frozen fixtures

Versioned and legacy fixtures live under
`tests/fixtures/compatibility`. Future releases must continue opening every
supported fixture or provide a deliberate migration test. The fixture set
contains:

- an unversioned v0.1 graph;
- a graph document v1;
- a scene document v1;
- portable HTML, SVG, and PNG manifest v1 documents.

These fixtures are compatibility evidence, not examples to rewrite when output
formatting changes.
