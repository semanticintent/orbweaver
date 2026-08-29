import { describe, expect, it, vi } from 'vitest'
import { runHtmlArtifactCli, type HtmlArtifactCliIo } from '../src/artifact/cli.js'

function setup(source = JSON.stringify({ id: 'cli-graph', title: 'CLI graph', nodes: [{ id: 'a', label: 'A' }], edges: [] })) {
  const files = new Map<string, string>([['graph.json', source]])
  const output = vi.fn<(message: string) => void>()
  const io: HtmlArtifactCliIo = {
    read: async (path) => files.get(path) ?? Promise.reject(new Error(`Missing ${path}`)),
    write: async (path, content) => { files.set(path, content) },
    output,
  }
  return { files, io, output }
}

describe('portable HTML artifact CLI', () => {
  it('writes a deterministic default artifact beside the source', async () => {
    const { files, io, output } = setup()
    const result = await runHtmlArtifactCli(['graph.json'], io)
    expect(result).toEqual({ code: 0, outputPath: 'graph.html' })
    expect(files.get('graph.html')).toMatch(/^<!doctype html>/)
    expect(files.get('graph.html')).toContain('"renderer":"Orbweaver CLI"')
    expect(output).toHaveBeenCalledWith('Wrote graph.html')
  })

  it('supports explicit output, light theme, and locked theme controls', async () => {
    const { files, io } = setup()
    await runHtmlArtifactCli(['graph.json', '--output', 'review.html', '--theme', 'light', '--no-theme-switch'], io)
    expect(files.get('review.html')).toContain('"theme":"light","allowThemeSwitch":false')
    expect(files.get('review.html')).not.toContain('<button type="button" data-theme-choice')
  })

  it('prints help and rejects invalid options before writing', async () => {
    const { files, io, output } = setup()
    await expect(runHtmlArtifactCli(['graph.json', '--theme', 'sepia'], io)).rejects.toThrow(/dark or light/)
    await expect(runHtmlArtifactCli(['--unknown', 'graph.json'], io)).rejects.toThrow(/Unknown option/)
    expect(files.has('graph.html')).toBe(false)
    expect(await runHtmlArtifactCli(['--help'], io)).toEqual({ code: 0 })
    expect(output).toHaveBeenLastCalledWith(expect.stringContaining('Usage: orbweaver-html'))
  })
})
