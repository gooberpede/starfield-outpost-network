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
import type {
  CargoItem,
  Product,
  Resource,
} from '../../domain/models'

interface CargoExportsEditorProps {
  resources: Resource[]
  products: Product[]
  exports: CargoItem[]
  availableItems: CargoItem[]
  onChange: (exports: CargoItem[]) => void
}

export function CargoExportsEditor({
  resources,
  products,
  exports,
  availableItems,
  onChange,
}: CargoExportsEditorProps) {

  /**
   * Tests whether an item is already selected for export by this pad.
   */
  function isExported(
    type: CargoItem['type'],
    id: string,
  ) {
    return exports.some(
      (item) =>
        item.type === type &&
        item.id === id,
    )
  }

  /**
   * Tests whether the network can currently account for this item being
   * available at the outpost.
   */
  function isAvailable(
    type: CargoItem['type'],
    id: string,
  ) {
    return availableItems.some(
      (item) =>
        item.type === type &&
        item.id === id,
    )
  }

  /**
   * Adds or removes one persistent outbound selection.
   *
   * Availability affects how the selection is displayed, not whether the
   * user is permitted to keep it.
   */
  function toggleExport(item: CargoItem) {
    if (isExported(item.type, item.id)) {
      onChange(
        exports.filter(
          (existingItem) =>
            !(
              existingItem.type === item.type &&
              existingItem.id === item.id
            ),
        ),
      )
    } else {
      onChange([
        ...exports,
        item,
      ])
    }
  }

/*
 * Show items supplied or planned at the outpost, plus any persistent
 * outbound selections whose source has subsequently disappeared.
 *
 * Cargo pads no longer expose the full catalogue themselves. Planning
 * assumptions belong to the outpost-level Planned Supply collection.
 */
const visibleResources =
  resources.filter(
    (resource) =>
      isAvailable(
        'resource',
        resource.id,
      ) ||
      isExported(
        'resource',
        resource.id,
      ),
  )

const visibleProducts =
  products.filter(
    (product) =>
      isAvailable(
        'product',
        product.id,
      ) ||
      isExported(
        'product',
        product.id,
      ),
  )

  return (
    <div>
      <h4>Exports</h4>

      <div>
        <strong>Resources</strong>

        {visibleResources.length === 0 ? (
          <p>None available.</p>
        ) : (
          visibleResources.map((resource) => {
            const available =
              isAvailable(
                'resource',
                resource.id,
              )

            const exported =
              isExported(
                'resource',
                resource.id,
              )

            return (
              <p key={`resource-${resource.id}`}>
                <label>
                  <input
                    type="checkbox"
                    checked={exported}
                    onChange={() =>
                      toggleExport({
                        type: 'resource',
                        id: resource.id,
                      })
                    }
                  />
                  {resource.name}

                  {exported && !available && (
                    <>
                      {' '}
                      ⚠ not currently available
                    </>
                  )}
                </label>
              </p>
            )
          })
        )}
      </div>

      <div>
        <strong>Manufactured Products</strong>

        {visibleProducts.length === 0 ? (
          <p>None available.</p>
        ) : (
          visibleProducts.map((product) => {
            const available =
              isAvailable(
                'product',
                product.id,
              )

            const exported =
              isExported(
                'product',
                product.id,
              )

            return (
              <p key={`product-${product.id}`}>
                <label>
                  <input
                    type="checkbox"
                    checked={exported}
                    onChange={() =>
                      toggleExport({
                        type: 'product',
                        id: product.id,
                      })
                    }
                  />
                  {product.name}

                  {exported && !available && (
                    <>
                      {' '}
                      ⚠ not currently available
                    </>
                  )}
                </label>
              </p>
            )
          })
        )}
      </div>
    </div>
  )
}