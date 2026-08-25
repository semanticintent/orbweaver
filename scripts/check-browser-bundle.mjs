import { build } from 'esbuild'

const result = await build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: ['es2022'],
  minify: true,
  write: false,
  metafile: true,
})

const bytes = result.outputFiles.reduce((total, file) => total + file.contents.byteLength, 0)
const limit = 2_500_000
console.log(`Browser bundle: ${(bytes / 1024).toFixed(1)} KiB minified`)
if (bytes > limit) throw new Error(`Browser bundle exceeds ${(limit / 1024).toFixed(0)} KiB limit.`)
