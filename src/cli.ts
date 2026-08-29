#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises'
import { runHtmlArtifactCli } from './artifact/cli.js'

try {
  const result = await runHtmlArtifactCli(process.argv.slice(2), {
    read: (path) => readFile(path, 'utf8'),
    write: (path, content) => writeFile(path, content, 'utf8'),
    output: (message) => process.stdout.write(`${message}\n`),
  })
  process.exitCode = result.code
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  process.stderr.write(`orbweaver-html: ${message}\n`)
  process.exitCode = 1
}
