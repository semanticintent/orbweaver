# Releasing

## Release gate

Run:

```sh
npm ci
npm run check
npm run browser:test
npm run examples:generate
npm pack --dry-run
```

For a v0.2 beta or later release candidate, also run the documented
cross-browser matrix:

```sh
ORBWEAVER_BROWSER_MATRIX=true npm run browser:test
```

Then inspect all generated showcase SVGs in light and dark themes and exercise
pointer, Enter/Space, Escape, inspector, download, JSON, and summary behavior in
the gallery.

## Gallery

```sh
npm run examples:generate
npm run examples:serve
```

Open `http://127.0.0.1:4173`.

## Publishing

The package is intended for public npm publication as
`@semanticintent/orbweaver`. Confirm npm authentication, repository URL,
release tag, and GitHub release notes before running `npm publish --access
public`.

Publishing and remote Git operations are deliberately not part of the local
release gate.

For the v0.2 beta contract and alpha-line review evidence, see
[v0.2 beta readiness](v0.2-beta-readiness.md).
