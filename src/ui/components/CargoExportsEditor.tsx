/**
 * CargoExportsEditor
 *
 * Purpose:
 *   Lets the user choose which resources and manufactured products a cargo
 *   pad exports.
 *
 * Architecture:
 *   The chooser is restricted to items selectable as supply at the outpost.
 *   That set is derived at outpost level from actual and planned supply.
 *
 *   Existing export selections are never removed merely because their supply
 *   disappears. Selected-but-unavailable items remain visible so changing
 *   supply does not silently delete cargo-pad configuration.
 *
 * Change this file when:
 *   - export-selection UX changes;
 *   - availability warnings need richer presentation;
 *   - additional cargo-item categories are introduced.
 */
import { useId } from 'react'
import type {
  CargoItem,
  Product,
  Resource,
} from '../../domain/models'
import { useLocalization } from '../../localization/LocalizationContext.ts'
import { compareLocalizedItems } from '../localizedCollation.ts'

interface CargoExportsEditorProps {
  resources: Resource[]
  products: Product[]
  exports: CargoItem[]
  availableItems: CargoItem[]
  onToggleExport: (item: CargoItem) => void
}

interface ExportCandidate {
  item: CargoItem
  name: string
  shortName: string
  group: 'inorganic' | 'organic' | 'manufactured'
}

export function CargoExportsEditor({
  resources,
  products,
  exports,
  availableItems,
  onToggleExport,
}: CargoExportsEditorProps) {
  const { locale, t } = useLocalization()
  const descriptionIdPrefix = useId()
  const getItemKey = (item: CargoItem) =>
    `${item.type}:${item.id}`

  const exportedKeys = new Set(exports.map(getItemKey))
  const availableKeys = new Set(availableItems.map(getItemKey))
  const candidateItems = new Map<string, CargoItem>()

  for (const item of [...availableItems, ...exports]) {
    candidateItems.set(getItemKey(item), item)
  }

  const candidates: ExportCandidate[] =
    [...candidateItems.values()].map((item) => {
      if (item.type === 'product') {
        const product = products.find(
          (candidate) => candidate.id === item.id,
        )

        return {
          item,
          name: product?.name ?? item.id,
          shortName: product?.shortName ?? item.id,
          group: 'manufactured',
        }
      }

      const resource = resources.find(
        (candidate) => candidate.id === item.id,
      )

      return {
        item,
        name: resource?.name ?? item.id,
        shortName: resource?.shortName ?? item.id,
        // Unknown resource IDs stay visible and removable instead of vanishing.
        group: resource?.category ?? 'inorganic',
      }
    })

  const groups = (
    ['inorganic', 'organic', 'manufactured'] as const
  ).map((group) =>
    candidates
      .filter((candidate) => candidate.group === group)
      .sort((left, right) =>
        compareLocalizedItems(
          { id: getItemKey(left.item), name: left.name },
          { id: getItemKey(right.item), name: right.name },
          locale,
        )),
  ).filter((group) => group.length > 0)

  return (
    <section className="cargo-exports">
      <h4>{t('cargo.exports.heading')}</h4>

      {groups.length === 0 ? (
        <p className="cargo-exports__empty">
          {t('cargo.exports.empty')}
        </p>
      ) : groups.map((group, groupIndex) => (
        <div
          className="cargo-exports__group"
          key={groupIndex}
        >
          {group.map((candidate) => {
            const itemKey = getItemKey(candidate.item)
            const isExported = exportedKeys.has(itemKey)
            const isStale =
              isExported && !availableKeys.has(itemKey)
            const staleDescriptionId = isStale
              ? `${descriptionIdPrefix}-${itemKey.replaceAll(':', '-')}`
              : undefined
            const staleDescription = isStale
              ? t('validation.unresolvedCargoExport')
              : null
            const tooltip = staleDescription
              ? t('validation.context.separator', {
                  outpost: candidate.name,
                  pad: staleDescription,
                })
              : candidate.name

            return (
              <span key={itemKey}>
                <button
                  className="cargo-exports__item"
                  data-state={isStale ? 'stale' : undefined}
                  type="button"
                  title={tooltip}
                  aria-label={t('cargo.export.toggle', { item: candidate.name })}
                  aria-describedby={staleDescriptionId}
                  aria-pressed={isExported}
                  onClick={() => onToggleExport(candidate.item)}
                >
                  {candidate.shortName}
                </button>
                {isStale && (
                  <span id={staleDescriptionId} className="ui-visually-hidden">
                    {staleDescription}
                  </span>
                )}
              </span>
            )
          })}
        </div>
      ))}
    </section>
  )
}
