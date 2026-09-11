import { useRef } from 'react'
import { deserializeNetworkCollection } from '../../data/serialization'
import type { NetworkCollection } from '../../data/networkCollection'
import { useLocalization } from '../../localization/LocalizationContext.ts'
import type { MessageDescriptor } from '../../localization/types.ts'
import { getImportFailurePresentation } from '../importErrorPresentation.ts'

interface NetworkImportButtonProps {
  onImport: (
    collection: NetworkCollection,
    fileName: string,
  ) => void

  onImportError: (
    fileName: string,
    reason: MessageDescriptor,
    diagnostic?: string,
  ) => void
}

export function NetworkImportButton({
  onImport,
  onImportError,
}: NetworkImportButtonProps) {
  const { t } = useLocalization()
  const fileInputRef =
    useRef<HTMLInputElement>(null)

  function importNetwork(file: File) {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        onImportError(
          file.name,
          { key: 'status.import.readFailed' },
        )

        return
      }

      try {
        const collection = deserializeNetworkCollection(reader.result)

        onImport(
          collection,
          file.name,
        )
      } catch (error) {
        const failure = getImportFailurePresentation(error)
        onImportError(file.name, failure.reason, failure.diagnostic)
      }
    }

    reader.onerror = () => {
      onImportError(
        file.name,
        { key: 'status.import.readFailed' },
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
        title={t('transfer.import.tooltip')}
      >
        {t('transfer.import.button')}
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
