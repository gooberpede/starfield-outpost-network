import { useEffect, useState } from 'react'
import App from './App'
import { loadReferenceData, ReferenceIntegrityError } from './data/referenceDataLoader'
import type { ReferenceFailure, ReferenceRequestMode } from './data/referenceDataLoader'
import type { ReferenceData } from './domain/referenceData'
import { ReferenceFatalState } from './ui/components/ReferenceFatalState'

type GateState = { kind: 'pending' } | { kind: 'failed'; failure: ReferenceFailure } | { kind: 'ready'; data: ReferenceData }

export function ReferenceStartupGate({ load = loadReferenceData, renderApp = (data: ReferenceData) => <App referenceData={data} /> }: {
  load?: (signal?: AbortSignal, requestMode?: ReferenceRequestMode) => Promise<ReferenceData>
  renderApp?: (data: ReferenceData) => React.ReactNode
}) {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<GateState>({ kind: 'pending' })
  useEffect(() => {
    const controller = new AbortController()
    let active = true
    const requestMode: ReferenceRequestMode = attempt === 0 ? 'normal' : 'retry'
    void load(controller.signal, requestMode).then((data) => {
      if (active) setState({ kind: 'ready', data })
    }).catch((error: unknown) => {
      if (!active) return
      setState({ kind: 'failed', failure: error instanceof ReferenceIntegrityError ? error.failure : { code: 'REF_LOADER_INTERNAL' } })
    })
    return () => { active = false; controller.abort() }
  }, [attempt, load])
  if (state.kind === 'ready') return renderApp(state.data)
  if (state.kind === 'failed') return <ReferenceFatalState failure={state.failure} onReload={() => {
    setState({ kind: 'pending' })
    setAttempt((current) => current + 1)
  }} />
  return <main className="reference-fatal" aria-busy="true" />
}
