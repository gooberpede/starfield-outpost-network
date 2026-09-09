import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LocalizationProvider } from './localization/LocalizationProvider.tsx'

if (import.meta.env.DEV && new URLSearchParams(window.location.search).has('historyBenchmark')) {
  void import('./dev/historyBenchmark.ts').then(({ installBrowserHistoryBenchmark }) => {
    installBrowserHistoryBenchmark()
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocalizationProvider>
      <App />
    </LocalizationProvider>
  </StrictMode>,
)
