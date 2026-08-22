import { useState } from 'react'

import { deserializeNetwork } from '../../data/serialization'
import type { OutpostNetwork } from '../../domain/models'

interface NetworkImportButtonProps {
  onImport: (network: OutpostNetwork) => void
}

export function NetworkImportButton({
  onImport,
}: NetworkImportButtonProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  function importNetwork(file: File) {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setErrorMessage('The selected file could not be read.')
        return
      }

      try {
        const network = deserializeNetwork(reader.result)

        onImport(network)
        setErrorMessage(null)
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message)
        } else {
          setErrorMessage('The selected file could not be imported.')
        }
      }
    }

    reader.onerror = () => {
      setErrorMessage('The selected file could not be read.')
    }

    reader.readAsText(file)
  }

  return (
    <div>
      <label>
        Import JSON
        <input
          type="file"
          accept="application/json,.json"
          onChange={(event) => {
            const file = event.target.files?.[0]

            if (file) {
              importNetwork(file)
            }
          }}
        />
      </label>

      {errorMessage && (
        <p>
          <strong>Import failed:</strong> {errorMessage}
        </p>
      )}
    </div>
  )
}