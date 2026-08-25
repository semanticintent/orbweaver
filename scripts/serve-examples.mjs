import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'

const root = join(process.cwd(), 'examples', 'generated')
const port = Number(process.env.ORBWEAVER_EXAMPLE_PORT ?? 4173)
const types = { '.html': 'text/html; charset=utf-8', '.svg': 'image/svg+xml', '.js': 'text/javascript; charset=utf-8' }

createServer((request, response) => {
  const pathname = new URL(request.url ?? '/', 'http://localhost').pathname
  const relative = pathname === '/' ? 'index.html' : pathname.slice(1)
  const file = normalize(join(root, relative))
  if (!file.startsWith(root) || !existsSync(file) || !statSync(file).isFile()) {
    response.writeHead(404).end('Not found')
    return
  }
  response.setHeader('Content-Type', types[extname(file)] ?? 'application/octet-stream')
  createReadStream(file).pipe(response)
}).listen(port, '127.0.0.1', () => {
  console.log(`Orbweaver showcase: http://127.0.0.1:${port}`)
})
