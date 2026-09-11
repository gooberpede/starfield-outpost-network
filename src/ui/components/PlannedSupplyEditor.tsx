/**
 * PlannedSupplyEditor.tsx
 *
 * Purpose:
 *   Presents the complete resource and manufactured-product catalogues as
 *   dense controls for recording unresolved supply intent at an outpost.
 *
 * Architecture:
 *   The grids derive their positions entirely from runtime reference data.
 *   This component derives only presentation state; the application layer
 *   continues to own Planned Supply persistence and Undo/Redo history.
 *
 * Change this file when:
 *   - Planned Supply catalogue layout or item presentation changes;
 *   - reference metadata provides a new way to arrange catalogue items.
 *
 * Do not put availability, cargo, or source-resolution rules here.
 */

import {
  useState,
  type CSSProperties,
} from 'react'

import type {
  CargoItem,
  Product,
  Resource,
} from '../../domain/models'
import type { Rarity } from '../../domain/referenceData'
import { contextHelpText } from '../contextHelpText'
import { ContextHelp } from './ContextHelp'
import { useLocalization } from '../../localization/LocalizationContext.ts'

import './PlannedSupplyEditor.css'

interface PlannedSupplyEditorProps {
  resources: Resource[]
  products: Product[]
  plannedSupply: CargoItem[]
  actuallyAvailableItems: CargoItem[]
  onTogglePlannedSupply: (item: CargoItem) => void
}

type CatalogueItem = Resource | Product

interface PositionedResource {
  resource: Resource
  columnStart: number
}

interface InorganicFamilyLayout {
  root: Resource
  columnCount: number
  resources: PositionedResource[]
}

const rarityOrder: Rarity[] = [
  'common',
  'uncommon',
  'rare',
  'exotic',
  'unique',
]

const rarityPosition = new Map(
  rarityOrder.map((rarity, index) => [
    rarity,
    index + 1,
  ]),
)

function compareByName(
  left: CatalogueItem,
  right: CatalogueItem,
) {
  return left.name.localeCompare(right.name)
}

/** Explicit sibling order wins; names provide a stable fallback. */
function compareInorganicSiblings(
  left: Resource,
  right: Resource,
) {
  if (
    left.sortOrder !== null &&
    right.sortOrder !== null &&
    left.sortOrder !== right.sortOrder
  ) {
    return left.sortOrder - right.sortOrder
  }

  if (left.sortOrder !== null) {
    return -1
  }

  if (right.sortOrder !== null) {
    return 1
  }

  return compareByName(left, right)
}

/**
 * Assigns each branch a compact descendant footprint on a half-step lattice.
 * Leaves establish the footprint and each ancestor is centered over its
 * descendants, keeping branching legible without relationship graphics or
 * hand-authored coordinates.
 */
function layoutInorganicFamily(
  root: Resource,
  childrenByParent: Map<string, Resource[]>,
): InorganicFamilyLayout {
  const resources: PositionedResource[] = []
  const visited = new Set<string>()

  function placeBranch(
    resource: Resource,
    startingLeaf: number,
  ): number {
    if (visited.has(resource.id)) {
      return 0
    }

    visited.add(resource.id)
    const positionedResource: PositionedResource = {
      resource,
      columnStart: 0,
    }
    resources.push(positionedResource)

    const children = [
      ...(childrenByParent.get(resource.id) ?? []),
    ].sort(compareInorganicSiblings)

    if (children.length === 0) {
      positionedResource.columnStart =
        (startingLeaf * 2) + 1

      return 1
    }

    let branchWidth = 0

    for (const child of children) {
      branchWidth += placeBranch(
        child,
        startingLeaf + branchWidth,
      )
    }

    branchWidth = Math.max(branchWidth, 1)
    positionedResource.columnStart =
      (startingLeaf * 2) + branchWidth

    return branchWidth
  }

  const columnCount = placeBranch(root, 0)

  return {
    root,
    columnCount,
    resources,
  }
}

function groupByRarity<T extends CatalogueItem>(
  items: T[],
) {
  return rarityOrder.map((rarity) =>
    items
      .filter((item) => item.rarity === rarity)
      .sort(compareByName),
  )
}

export function PlannedSupplyEditor({
  resources,
  products,
  plannedSupply,
  actuallyAvailableItems,
  onTogglePlannedSupply,
}: PlannedSupplyEditorProps) {
  const { t } = useLocalization()
  const [isExpanded, setIsExpanded] = useState(false)

  const plannedKeys = new Set(
    plannedSupply.map(
      (item) => `${item.type}:${item.id}`,
    ),
  )

  const availableKeys = new Set(
    actuallyAvailableItems.map(
      (item) => `${item.type}:${item.id}`,
    ),
  )

  function renderItemControl(
    item: CatalogueItem,
    type: CargoItem['type'],
    style?: CSSProperties,
  ) {
    const cargoItem: CargoItem = {
      type,
      id: item.id,
    }
    const itemKey = `${type}:${item.id}`
    const isAvailable = availableKeys.has(itemKey)
    const isPlanned = plannedKeys.has(itemKey)
    const state = isAvailable
      ? 'available'
      : isPlanned
        ? 'planned'
        : 'neither'

    return (
      <button
        className="planned-supply__item"
        data-state={state}
        key={itemKey}
        type="button"
        title={item.name}
        aria-label={isAvailable
          ? item.name
          : t(isPlanned ? 'plannedSupply.remove' : 'plannedSupply.add', { item: item.name })}
        aria-disabled={isAvailable}
        aria-pressed={!isAvailable && isPlanned}
        style={style}
        onClick={() => {
          if (!isAvailable) {
            onTogglePlannedSupply(cargoItem)
          }
        }}
      >
        {item.shortName}
      </button>
    )
  }

  function renderCompactItem(
    item: CatalogueItem,
    type: CargoItem['type'],
  ) {
    const cargoItem: CargoItem = {
      type,
      id: item.id,
    }

    return (
      <button
        className="planned-supply__item planned-supply__compact-item"
        data-state="planned"
        key={`${type}:${item.id}`}
        type="button"
        title={item.name}
        aria-label={t('plannedSupply.remove', { item: item.name })}
        aria-pressed="true"
        onClick={() => onTogglePlannedSupply(cargoItem)}
      >
        {item.shortName}
      </button>
    )
  }

  function renderFlatRarityGrid(
    items: CatalogueItem[],
    type: CargoItem['type'],
    gridClassName: string,
  ) {
    const rows = groupByRarity(items)
    const columnCount = Math.max(
      1,
      ...rows.map((row) => row.length),
    )

    return (
      <div className="planned-supply__overflow">
        <div
          className={`planned-supply__flat-grid ${gridClassName}`}
          style={{
            gridTemplateColumns:
              `repeat(${columnCount}, var(--planned-supply-cell-width))`,
          }}
        >
          {rows.flatMap((row, rowIndex) =>
            row.map((item, columnIndex) =>
              renderItemControl(
                item,
                type,
                {
                  gridColumn: columnIndex + 1,
                  gridRow: rowIndex + 1,
                },
              ),
            ),
          )}
        </div>
      </div>
    )
  }

  const inorganicResources = resources.filter(
    (resource) => resource.category === 'inorganic',
  )
  const organicResources = resources.filter(
    (resource) => resource.category === 'organic',
  )
  const inorganicIds = new Set(
    inorganicResources.map((resource) => resource.id),
  )
  const childrenByParent = new Map<string, Resource[]>()

  for (const resource of inorganicResources) {
    if (
      resource.parentId !== null &&
      inorganicIds.has(resource.parentId)
    ) {
      const siblings = childrenByParent.get(resource.parentId) ?? []
      childrenByParent.set(
        resource.parentId,
        [...siblings, resource],
      )
    }
  }

  const roots = inorganicResources.filter(
    (resource) =>
      resource.parentId === null ||
      !inorganicIds.has(resource.parentId),
  )
  const specialInorganic = roots
    .filter((resource) => resource.plannedSupplyPlacement === 'special')
    .sort(compareInorganicSiblings)
  const inorganicFamilies = roots
    .filter((resource) => resource.plannedSupplyPlacement === 'family')
    .sort(compareInorganicSiblings)
    .map((root) =>
      layoutInorganicFamily(root, childrenByParent),
    )

  /*
   * Compact mode favors quick scanning over the expanded catalogue's spatial
   * semantics, so planned items use category order and full-name sorting.
   */
  const compactGroups: Array<{
    items: CatalogueItem[]
    type: CargoItem['type']
  }> = [
    {
      type: 'resource',
      items: inorganicResources
        .filter((resource) =>
          plannedKeys.has(`resource:${resource.id}`),
        )
        .sort(compareByName),
    },
    {
      type: 'resource',
      items: organicResources
        .filter((resource) =>
          plannedKeys.has(`resource:${resource.id}`),
        )
        .sort(compareByName),
    },
    {
      type: 'product',
      items: products
        .filter((product) =>
          plannedKeys.has(`product:${product.id}`),
        )
        .sort(compareByName),
    },
  ]
  const compactItemCount = compactGroups.reduce(
    (total, group) => total + group.items.length,
    0,
  )

  return (
    <section className="planned-supply">
      <h2 className="planned-supply__heading">
        <button
          className="planned-supply__expand-toggle"
          type="button"
          title={
            isExpanded
              ? t('plannedSupply.collapse')
              : t('plannedSupply.expand')
          }
          aria-label={
            isExpanded
              ? t('plannedSupply.collapse')
              : t('plannedSupply.expand')
          }
          aria-expanded={isExpanded}
          onClick={() =>
            setIsExpanded((current) => !current)
          }
        >
          {isExpanded ? '▼' : '▶'}
        </button>

        <span>{t('plannedSupply.heading')}</span>
        <ContextHelp
          context={t('plannedSupply.heading')}
          text={t(contextHelpText.plannedSupply)}
        />
      </h2>

      {!isExpanded && (
        compactItemCount === 0
          ? <p className="planned-supply__empty">{t('plannedSupply.empty')}</p>
          : (
              <div className="planned-supply__compact-list">
                {compactGroups
                  .filter((group) => group.items.length > 0)
                  .map((group) => (
                    <div
                      className="planned-supply__compact-group"
                      key={`${group.type}:${group.items[0].id}`}
                    >
                      {group.items.map((item) =>
                        renderCompactItem(item, group.type),
                      )}
                    </div>
                  ))}
              </div>
            )
      )}

      {isExpanded && (
        <div className="planned-supply__catalogue">
          <section className="planned-supply__section">
            <h3>{t('plannedSupply.section.inorganic')}</h3>

            <div className="planned-supply__overflow">
              <div className="planned-supply__inorganic">
                {specialInorganic.length > 0 && (
                  <div className="planned-supply__special-strip">
                    <div className="planned-supply__special-grid">
                      {specialInorganic.map((resource) =>
                        renderItemControl(resource, 'resource'),
                      )}
                    </div>
                  </div>
                )}

                <div className="planned-supply__families">
                  {inorganicFamilies.map((family) => (
                    <div
                      className="planned-supply__family"
                      key={family.root.id}
                      style={{
                        gridTemplateColumns:
                          `repeat(${family.columnCount * 2}, calc(var(--planned-supply-cell-pitch) / 2))`,
                      }}
                    >
                      {family.resources.map(({ resource, columnStart }) =>
                        renderItemControl(
                          resource,
                          'resource',
                          {
                            gridColumn: `${columnStart} / span 2`,
                            gridRow: rarityPosition.get(resource.rarity),
                          },
                        ),
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="planned-supply__catalogue-pair">
            <section className="planned-supply__section">
              <h3>{t('plannedSupply.section.organic')}</h3>

              {renderFlatRarityGrid(
                organicResources,
                'resource',
                'planned-supply__organic-grid',
              )}
            </section>

            <section className="planned-supply__section">
              <h3>{t('plannedSupply.section.products')}</h3>

              {renderFlatRarityGrid(
                products,
                'product',
                'planned-supply__product-grid',
              )}
            </section>
          </div>
        </div>
      )}
    </section>
  )
}
