import type { Graph } from '../model/types.js'
import { renderHtmlArtifact } from './html.js'
import type { PortableArtifactTheme } from './types.js'

export interface HtmlArtifactCliIo {
  read(path: string): Promise<string>
  write(path: string, content: string): Promise<void>
  output(message: string): void
}

export interface HtmlArtifactCliResult {
  code: number
  outputPath?: string
}

function outputPath(inputPath: string): string {
  return inputPath.toLowerCase().endsWith('.json') ? `${inputPath.slice(0, -5)}.html` : `${inputPath}.html`
}

function usage(): string {
  return 'Usage: orbweaver-html <graph.json> [--output artifact.html] [--theme dark|light] [--no-theme-switch]'
}

export async function runHtmlArtifactCli(args: readonly string[], io: HtmlArtifactCliIo): Promise<HtmlArtifactCliResult> {
  if (args.includes('--help') || args.includes('-h')) {
    io.output(usage())
    return { code: 0 }
  }
  let input: string | undefined
  let destination: string | undefined
  let theme: PortableArtifactTheme = 'dark'
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]
    if (argument === '--output') {
      const value = args[index + 1]
      if (value === undefined || value.startsWith('-')) throw new TypeError('--output requires a file path.')
      destination = value
      index += 1
    } else if (argument === '--theme') {
      const value = args[index + 1]
      if (value !== 'dark' && value !== 'light') throw new TypeError('--theme must be dark or light.')
      theme = value
      index += 1
    } else if (argument === '--no-theme-switch') {
      continue
    } else if (argument?.startsWith('-')) {
      throw new TypeError(`Unknown option: ${argument}`)
    } else if (argument !== undefined) {
      if (input !== undefined) throw new TypeError(`Unexpected input: ${argument}`)
      input = argument
    }
  }
  if (input === undefined) {
    io.output(usage())
    return { code: 1 }
  }
  destination ??= outputPath(input)
  const source = await io.read(input)
  const graph = JSON.parse(source) as Graph
  const html = await renderHtmlArtifact(graph, {
    theme,
    allowThemeSwitch: !args.includes('--no-theme-switch'),
    provenance: { renderer: 'Orbweaver CLI', source: { file: input } },
  })
  await io.write(destination, html)
  io.output(`Wrote ${destination}`)
  return { code: 0, outputPath: destination }
}
