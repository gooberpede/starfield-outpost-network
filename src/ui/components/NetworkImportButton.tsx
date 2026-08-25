import { useRef } from 'react'
import { deserializeNetwork } from '../../data/serialization'
import type { OutpostNetwork } from '../../domain/models'

interface NetworkImportButtonProps {
  onImport: (
    network: OutpostNetwork,
    fileName: string,
  ) => void

  onImportError: (
    fileName: string,
    message: string,
  ) => void
}

export function NetworkImportButton({
  onImport,
  onImportError,
}: NetworkImportButtonProps) {
  const fileInputRef =
    useRef<HTMLInputElement>(null)

  function importNetwork(file: File) {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        onImportError(
          file.name,
          'The selected file could not be read.',
        )

        return
      }

      try {
        const network = deserializeNetwork(reader.result)

        onImport(
          network,
          file.name,
        )
      } catch (error) {
        onImportError(
          file.name,
          error instanceof Error
            ? error.message
            : 'The selected file could not be imported.',
        )
      }
    }

    reader.onerror = () => {
      onImportError(
        file.name,
        'The selected file could not be read.',
      )
    }

    reader.readAsText(file)
  }

  return (
    <>
      <button
        type="button"
        onClick={() =>
          fileInputRef.current?.click()
        }
        title="Import network from JSON"
      >
        Import
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0]

          if (file) {
            importNetwork(file)
          }

          /*
          * Clear the selection so choosing the same file again still produces
          * a change event.
          */
          event.target.value = ''
        }}
      />
    </>
  )
}