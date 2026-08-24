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
  Outpost,
  Product,
  Resource,
} from '../../domain/models'

import type {
  ItemProvenance,
} from '../../domain/provenance'

interface CargoExportsEditorProps {
  resources: Resource[]
  products: Product[]
  outposts: Outpost[]
  exports: CargoItem[]
  availableItems: CargoItem[]
  getItemProvenance: (
    item: CargoItem,
  ) => ItemProvenance
  onToggleExport: (item: CargoItem) => void
}

export function CargoExportsEditor({
  resources,
  products,
  outposts,
  exports,
  availableItems,
  getItemProvenance,
  onToggleExport,
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
   * Formats structured provenance for the cargo catalogue.
   *
   * Domain provenance contains stable outpost IDs. This presentation helper
   * resolves those IDs to current outpost names and decides how the source
   * information should be displayed to the user.
   */
  function getSourceLabel(item: CargoItem) {
    const provenance =
      getItemProvenance(item)

    const sourceLabels: string[] = []

    if (provenance.local) {
      sourceLabels.push('local')
    }

    for (const remoteOutpostId of provenance.remoteOutpostIds) {
      const remoteOutpost =
        outposts.find(
          (candidate) =>
            candidate.id === remoteOutpostId,
        )

      sourceLabels.push(
        remoteOutpost?.name ??
          remoteOutpostId,
      )
    }

    return sourceLabels.length > 0
      ? sourceLabels.join(', ')
      : 'no source'
  }

  /**
   * Requests addition or removal of one persistent outbound selection.
   *
   * The application layer owns the persisted cargo-pad mutation so the toggle
   * can participate in Undo/Redo history as one deliberate user action.
   */
  function toggleExport(
    item: CargoItem,
  ) {
    onToggleExport(item)
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
            const exported =
              isExported(
                'resource',
                resource.id,
              )
            
            const item: CargoItem = {
              type: 'resource',
              id: resource.id,
            }

            const sourceLabel =
              getSourceLabel(item)

            return (
              <p key={`resource-${resource.id}`}>
                <label>
                  <input
                    type="checkbox"
                    checked={exported}
                    onChange={() =>
                      toggleExport(item)
                    }
                  />
                  {resource.name}

                  {' '}
                  <small>
                    — {sourceLabel}
                  </small>
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
            const exported =
              isExported(
                'product',
                product.id,
              )

            const item: CargoItem = {
              type: 'product',
              id: product.id,
            }

            const sourceLabel =
              getSourceLabel(item)

            return (
              <p key={`product-${product.id}`}>
                <label>
                  <input
                    type="checkbox"
                    checked={exported}
                    onChange={() =>
                      toggleExport(item)
                    }
                  />
                  {product.name}

                  {' '}
                  <small>
                    — {sourceLabel}
                  </small>
                </label>
              </p>
            )
          })
        )}
      </div>
    </div>
  )
}