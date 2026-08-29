# Quality and performance

Phase 10E is Orbweaver's release-quality gate. It adds evidence around the
existing semantic, layout, rendering, interaction, and export contracts; it
does not add new runtime features.

## Delivery scope

1. Maintain a named resilience corpus covering empty, disconnected, cyclic,
   deeply nested, dense, long-label, Unicode, sparse-metadata, and nested-group
   graphs.
2. Exercise interaction and accessibility behavior in real browsers and make
   that verification part of continuous integration.
3. Compare deterministic light and dark SVG output against reviewed visual
   baselines.
4. measure layout, rendering, and package cost on representative small,
   medium, and large graphs, then enforce budgets with enough tolerance for
   shared CI runners.
5. Publish the supported runtime, browser, module, bundler, and artifact
   matrix.

## Representative graph classes

| Class | Shape | Purpose |
| --- | --- | --- |
| Small | 4 nodes, 3 edges | Startup and basic-render overhead |
| Medium | 25 nodes, 36 edges, nested groups | Normal architecture and workflow use |
| Large | 75 nodes, 120 edges, multiple groups | Practical stress boundary for the core renderer |

The resilience corpus is the canonical source for these inputs. Performance
graphs are deterministic and contain no random data.

## Initial budgets

Budgets are release gates, not performance claims. The baseline command records
observations locally; CI uses deliberately wider ceilings to avoid treating
shared-runner noise as a regression.

| Measure | Initial gate |
| --- | ---: |
| Browser bundle, minified and uncompressed | 1.65 MiB |
| Small layout + SVG render, median | 150 ms |
| Medium layout + SVG render, median | 750 ms |
| Large layout + SVG render, median | 2,500 ms |
| Mounted interaction response | one animation frame |

Before `0.2.0-beta.1`, these provisional timing ceilings must be calibrated
from local macOS and GitHub-hosted Linux observations. A budget may only be
raised with a recorded fixture or environment explanation.

The initial macOS arm64 baseline for `0.2.0-alpha.14` measured approximately
6 ms, 34 ms, and 439 ms for the small, medium, and large fixtures respectively.
The wider enforced ceilings preserve regression sensitivity without confusing
normal shared-runner variance for a product regression.

## Supported environments

The supported matrix for the 10E gate is:

| Environment | Automated evidence | Support statement |
| --- | --- | --- |
| Node.js 20, 22, 24 | Full type, unit, build, and bundle gates | Supported ESM runtimes |
| Chromium | Playwright interaction, responsive, print, and axe suite | Current Playwright Chromium; representative of current Chrome and Edge |
| Firefox | The same Playwright suite | Current Playwright Firefox |
| WebKit | The same Playwright suite | Current Playwright WebKit portability |
| Safari on macOS | Manual release smoke check | Current Safari; WebKit CI is supporting evidence, not a substitute for Safari |
| ESM bundlers | Minified esbuild browser bundle | Standards-based ESM bundlers targeting ES2022 |

PNG generation in browsers requires the Canvas, Blob, Image, and object-URL
APIs documented in the export guarantee matrix. Node.js PNG generation still
requires a host-provided rasterizer.

## Verification commands

```sh
npm run check
npm run browser:test
npm run performance:check
```

`npm run quality:check` composes all three local gates. The default browser
command runs Chromium; CI sets `ORBWEAVER_BROWSER_MATRIX=true` and runs the
same suite in Chromium, Firefox, and WebKit. Safari remains a documented manual
check because Playwright WebKit is a portability proxy, not Safari itself.

Visual regression uses exact SVG signatures: reviewed dimensions, UTF-8 byte
length, and SHA-256 hashes for representative nested and internationalized
graphs in both themes. This avoids platform-dependent bitmap text rasterization
while detecting any change to geometry, routing, content, accessibility markup,
or visual styling.

## Acceptance gate

Phase 10E is complete when:

- every resilience fixture validates as expected, produces finite scene
  geometry, renders safely, and remains deterministic;
- browser interaction and automated accessibility checks pass in CI;
- reviewed light and dark visual baselines are stable;
- bundle, layout, and render budgets are enforced;
- the compatibility matrix is reflected in package documentation; and
- the complete `npm run check` release gate passes from a clean install.
