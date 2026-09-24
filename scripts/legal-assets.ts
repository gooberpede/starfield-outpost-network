/** Emit authoritative legal files separately from JavaScript, on demand in dev. */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

export function legalAssets(root: string): Plugin {
  const files = {
    'legal/LICENSE.txt': 'LICENSE',
    'legal/THIRD-PARTY-NOTICE.txt': 'THIRD-PARTY-NOTICE.md',
  }
  const read = (source: string) => {
    const content = readFileSync(path.join(root, source), 'utf8')
    if (!content.trim()) throw new Error(`Empty legal source: ${source}`)
    return content
  }
  return {
    name: 'project-legal-assets',
    generateBundle() {
      for (const [fileName, source] of Object.entries(files)) {
        this.emitFile({ type: 'asset', fileName, source: read(source) })
      }
    },
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const entry = Object.entries(files).find(([name]) => request.url?.split('?')[0] === `/${name}`)
        if (!entry) return next()
        response.setHeader('Content-Type', 'text/plain; charset=utf-8')
        response.end(read(entry[1]))
      })
    },
  }
}
