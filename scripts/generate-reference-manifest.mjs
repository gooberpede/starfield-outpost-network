/** Completes the deliberate reference:build workflow after JSON generation. */
import { generateReferenceManifest } from './verify-reference-deployment.mjs'

generateReferenceManifest().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
