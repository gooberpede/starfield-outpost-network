import type { OutpostNetwork } from '../../domain/models'
import { serializeNetwork } from '../../data/serialization'
import { createNetworkExportFileName } from '../../data/exportFileName'

interface NetworkExportButtonProps {
  network: OutpostNetwork
  onExport: (fileName: string) => void
}

export function NetworkExportButton({
  network,
  onExport,
}: NetworkExportButtonProps) {
  function exportNetwork() {
    const json = serializeNetwork(network)

    const blob = new Blob([json], {
      type: 'application/json',
    })

    const url = URL.createObjectURL(blob)

    const fileName =
      createNetworkExportFileName(
        network.character.name,
      )

    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()

    URL.revokeObjectURL(url)

    onExport(fileName)
  }

  return (
    <button
      type="button"
      onClick={exportNetwork}
      title="Export network to JSON"
    >
      Export
    </button>
  )
}