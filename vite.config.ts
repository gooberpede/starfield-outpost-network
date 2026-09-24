import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readBuildIdentity } from './scripts/build-identity.ts'
import { legalAssets } from './scripts/legal-assets.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), legalAssets(import.meta.dirname)],
  define: { __BUILD_IDENTITY__: JSON.stringify(readBuildIdentity(import.meta.dirname)) },
  
  server: {
    watch: {
      ignored: ['**/reference-source/**'],
    },
  },
})
