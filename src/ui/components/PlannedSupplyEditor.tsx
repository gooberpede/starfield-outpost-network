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

import type {
  CargoItem,
  Product,
  Resource,
} from '../../domain/models'

interface PlannedSupplyEditorProps {
  resources: Resource[]
  products: Product[]
  plannedSupply: CargoItem[]
  onChange: (plannedSupply: CargoItem[]) => void
}

export function PlannedSupplyEditor({
  resources,
  products,
  plannedSupply,
  onChange,
}: PlannedSupplyEditorProps) {
  /**
   * Returns whether one catalogue item is already part of the outpost's
   * persisted planning assumption.
   */
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

  return (
    <section>
      <h2>Planned Supply</h2>

      <div>
        <strong>Resources</strong>

        {resources.map((resource) => (
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

              {resource.name} ({resource.shortName})
            </label>
          </p>
        ))}
      </div>

      <div>
        <strong>Manufactured Products</strong>

        {products.map((product) => (
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

              {product.name} ({product.shortName})
            </label>
          </p>
        ))}
      </div>
    </section>
  )
}