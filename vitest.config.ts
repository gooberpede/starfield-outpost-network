import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { readBuildIdentity } from './scripts/build-identity.ts'

export default defineConfig({
  plugins: [react()],
  define: { __BUILD_IDENTITY__: JSON.stringify(readBuildIdentity(import.meta.dirname)) },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.tsx'],
    setupFiles: ['./tests/componentTestSetup.ts'],
  },
})
