import type { OutpostNetwork } from '../../domain/models'
import { serializeNetwork } from '../../data/serialization'

interface NetworkExportButtonProps {
  network: OutpostNetwork
}

export function NetworkExportButton({
  network,
}: NetworkExportButtonProps) {
  function exportNetwork() {
    const json = serializeNetwork(network)

    const blob = new Blob([json], {
      type: 'application/json',
    })

    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = 'starfield-outpost-network.json'
    link.click()

    URL.revokeObjectURL(url)
  }

  return (
    <button type="button" onClick={exportNetwork}>
      Export JSON
    </button>
  )
}