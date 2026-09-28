/**
 * Purpose:
 *   Select, bound, read, and deserialize a whole-collection import file.
 *
 * Architecture:
 *   Owns browser file I/O and parse-error presentation. Only a fully read and
 *   validated collection crosses `onImport`; the application owns mutation,
 *   selection repair, persistence, and the single Undo entry.
 *
 * Change this file when:
 *   File selection, reading, import handoff, or import-error presentation changes.
 */
import { useRef } from 'react'
import type { Ref } from 'react'
import { deserializeNetworkCollection } from '../../data/serialization'
import { MAX_EXTERNAL_IMPORT_BYTES } from '../../data/externalImportValidation.ts'
import { NetworkImportError } from '../../data/importErrors.ts'
import type { NetworkCollection } from '../../data/networkCollection'
import { useLocalization } from '../../localization/LocalizationContext.ts'
import type { MessageDescriptor } from '../../localization/types.ts'
import { getImportFailurePresentation } from '../importErrorPresentation.ts'

interface NetworkImportButtonProps {
  actionRef?: Ref<HTMLButtonElement>
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
  actionRef,
  onImport,
  onImportError,
}: NetworkImportButtonProps) {
  const { t } = useLocalization()
  const fileInputRef =
    useRef<HTMLInputElement>(null)

  function importNetwork(file: File) {
    if (file.size > MAX_EXTERNAL_IMPORT_BYTES) {
      const failure = getImportFailurePresentation(new NetworkImportError('file-too-large', {
        actual: file.size, maximum: MAX_EXTERNAL_IMPORT_BYTES,
      }))
      onImportError(file.name, failure.reason, failure.diagnostic)
      return
    }
    // Reading and deserialization finish before handoff; failures never acquire
    // application mutation or history ownership through this component.
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
        ref={actionRef}
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
