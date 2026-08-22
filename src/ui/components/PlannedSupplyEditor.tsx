/**
 * PlannedSupplyEditor.tsx
 *
 * Purpose:
 *   Lets the user record resources or manufactured products that an outpost
 *   is expected to receive even though no actual supply route currently
 *   provides them.
 *
 * Architecture:
 *   Planned supply belongs to the Outpost rather than to an individual cargo
 *   pad. This component edits only that persisted list and does not determine
 *   whether an item has an actual local or inbound source.
 *
 *   Actual availability and source provenance remain derived domain concerns.
 *   A later availability pass will combine planned supply with active local
 *   production, manufacturing, and inbound cargo.
 *
 * Change this file when:
 *   - the Planned Supply editing UI changes;
 *   - resources/products need different grouping or filtering;
 *   - planned items need additional presentation information.
 *
 * Do not put cargo-pad-specific rules or source-resolution logic here.
 */

import { useState } from 'react'

import type {
  CargoItem,
  Product,
  Resource,
} from '../../domain/models'

interface PlannedSupplyEditorProps {
  resources: Resource[]
  products: Product[]
  plannedSupply: CargoItem[]
  actuallyAvailableItems: CargoItem[]
  onChange: (plannedSupply: CargoItem[]) => void
}

export function PlannedSupplyEditor({
  resources,
  products,
  plannedSupply,
  actuallyAvailableItems,
  onChange,
}: PlannedSupplyEditorProps) {
  /**
   * Returns whether one catalogue item is already part of the outpost's
   * persisted planning assumption.
   */
  const [isExpanded, setIsExpanded] = useState(false)

  function isPlanned(
    type: CargoItem['type'],
    id: string,
  ) {
    return plannedSupply.some(
      (item) =>
        item.type === type &&
        item.id === id,
    )
  }

  /**
   * Returns whether an item already has a real source at this outpost.
   *
   * Planned Supply itself is excluded from this test; this answers only
   * whether the recorded network currently provides the item.
   */
  function isActuallyAvailable(
    type: CargoItem['type'],
    id: string,
  ) {
    return actuallyAvailableItems.some(
      (item) =>
        item.type === type &&
        item.id === id,
    )
  }

  /**
   * Adds or removes one item without affecting actual production, imports,
   * manufacturing, or any cargo-pad outbound selections.
   */
  function togglePlannedSupply(item: CargoItem) {
    if (isPlanned(item.type, item.id)) {
      onChange(
        plannedSupply.filter(
          (existingItem) =>
            !(
              existingItem.type === item.type &&
              existingItem.id === item.id
            ),
        ),
      )

      return
    }

    onChange([
      ...plannedSupply,
      item,
    ])
  }

  /*
  * Expanded view offers the complete catalogue of currently unsourced items.
  *
  * Collapsed view acts as a compact summary and therefore shows only items
  * already selected as Planned Supply.
  */
  const visibleResources =
    resources.filter(
      (resource) =>
        isPlanned(
          'resource',
          resource.id,
        ) ||
        (
          isExpanded &&
          !isActuallyAvailable(
            'resource',
            resource.id,
          )
        ),
    )

  const visibleProducts =
    products.filter(
      (product) =>
        isPlanned(
          'product',
          product.id,
        ) ||
        (
          isExpanded &&
          !isActuallyAvailable(
            'product',
            product.id,
          )
        ),
    )

  return (
    <section>
      <h2>
        <button
          type="button"
          onClick={() =>
            setIsExpanded((current) => !current)
          }
          aria-expanded={isExpanded}
        >
          {isExpanded ? '▼' : '▶'}
        </button>

        {' '}
        Planned Supply
      </h2>
      {!isExpanded && plannedSupply.length === 0 && (
          <p>No planned supply.</p>
      )}

      {visibleResources.length > 0 && (
        <div>
          <strong>Resources</strong>

          {visibleResources.map((resource) => (
            <p key={`resource-${resource.id}`}>
              <label>
                <input
                  type="checkbox"
                  checked={isPlanned(
                    'resource',
                    resource.id,
                  )}
                  onChange={() =>
                    togglePlannedSupply({
                      type: 'resource',
                      id: resource.id,
                    })
                  }
                />

                {resource.name}
              </label>
            </p>
          ))}
        </div>
      )}

      {visibleProducts.length > 0 && (
        <div>
          <strong>Manufactured Products</strong>

          {visibleProducts.map((product) => (
            <p key={`product-${product.id}`}>
              <label>
                <input
                  type="checkbox"
                  checked={isPlanned(
                    'product',
                    product.id,
                  )}
                  onChange={() =>
                    togglePlannedSupply({
                      type: 'product',
                      id: product.id,
                    })
                  }
                />

                {product.name}
              </label>
            </p>
          ))}
        </div>
      )}

    </section>
  )
}