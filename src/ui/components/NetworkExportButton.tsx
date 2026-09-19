import type { NetworkCollection } from '../../data/networkCollection'
import { getActiveSavedNetwork } from '../../data/networkCollection'
import { serializeNetworkCollection } from '../../data/serialization'
import { createNetworkExportFileName } from '../../data/exportFileName'
import { useLocalization } from '../../localization/LocalizationContext.ts'
import type { Ref } from 'react'

interface NetworkExportButtonProps {
  actionRef?: Ref<HTMLButtonElement>
  collection: NetworkCollection
  onExport: (fileName: string) => void
}

export function NetworkExportButton({
  actionRef,
  collection,
  onExport,
}: NetworkExportButtonProps) {
  const { t } = useLocalization()
  function exportNetwork() {
    const json = serializeNetworkCollection(collection)
    const activeCharacter = getActiveSavedNetwork(collection).network.character

    const blob = new Blob([json], {
      type: 'application/json',
    })

    const url = URL.createObjectURL(blob)

    const fileName =
      createNetworkExportFileName(
        activeCharacter.name,
        activeCharacter.level,
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
      ref={actionRef}
      type="button"
      onClick={exportNetwork}
      title={t('transfer.export.tooltip')}
    >
      {t('transfer.export.button')}
    </button>
  )
}
