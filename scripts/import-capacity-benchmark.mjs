import { createServer } from 'vite'

// Vite's module loader resolves the application's extensionless TypeScript imports.
const server = await createServer({ logLevel: 'silent', server: { middlewareMode: true }, appType: 'custom' })
try {
  const { runBenchmark } = await server.ssrLoadModule('/scripts/import-capacity-benchmark.ts')
  await runBenchmark()
} finally {
  await server.close()
}
