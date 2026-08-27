/**
 * OutpostStatusMatrix.tsx
 *
 * Purpose:
 *   Presents body resources, local manufacturing, and cargo status in one
 *   stable six-column matrix for the selected outpost.
 *
 * Architecture:
 *   Persisted edits are requested through application callbacks. Manufacturing
 *   edit mode is local presentation state and commits its complete draft only
 *   on Save. Availability and logistics inputs are derived outside the JSX.
 *
 * Change this file when:
 *   - the shared outpost status vocabulary or manufacturing draft flow changes;
 *   - additional derived cells are introduced into the established columns.
 */

import { useMemo, useState } from 'react'

import {
  getCargoItemKey,
  getExportedItemKeysAtOutpost,
  getImportSummariesAtOutpost,
} from '../../domain/logistics'
import type {
  CargoItem,
  ManufacturingEntry,
  Outpost,
  OutpostNetwork,
  Product,
  Resource,
} from '../../domain/models'
import type {
  ProductId,
  ProductRecipeReference,
  ResourceId,
} from '../../domain/referenceData'

import './OutpostStatusMatrix.css'

interface OutpostStatusMatrixProps {
  outpost: Outpost
  network: OutpostNetwork
  resources: Resource[]
  bodyResources: Resource[]
  products: Product[]
  productRecipes: ProductRecipeReference[]
  actuallyAvailableItems: CargoItem[]
  onToggleResource: (resourceId: ResourceId) => void
  onToggleActiveProduction: (resourceId: ResourceId) => void
  onCommitManufacturing: (entries: ManufacturingEntry[]) => void
}

interface ItemDisplay {
  name: string
  shortName: string
}

function ReadOnlyState({
  item,
  lit,
}: {
  item: ItemDisplay
  lit: boolean
}) {
  return (
    <span
      className="outpost-status-matrix__state"
      data-state={lit ? 'lit' : 'dimmed'}
      title={item.name}
      aria-label={`${item.name}: ${lit ? 'active' : 'inactive'}`}
      tabIndex={0}
    >
      {item.shortName}
    </span>
  )
}

function EditableState({
  item,
  pressed,
  disabled = false,
  label,
  onClick,
}: {
  item: ItemDisplay
  pressed: boolean
  disabled?: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      className="outpost-status-matrix__state outpost-status-matrix__state--editable"
      type="button"
      aria-pressed={pressed}
      aria-label={`${label} ${item.name}`}
      title={disabled ? `${item.name}: mark Present before Producing` : item.name}
      disabled={disabled}
      onClick={onClick}
    >
      {item.shortName}
    </button>
  )
}

export function OutpostStatusMatrix({
  outpost,
  network,
  resources,
  bodyResources,
  products,
  productRecipes,
  actuallyAvailableItems,
  onToggleResource,
  onToggleActiveProduction,
  onCommitManufacturing,
}: OutpostStatusMatrixProps) {
  const [draftManufacturing, setDraftManufacturing] =
    useState<ManufacturingEntry[] | null>(null)
  const [isAddingProduct, setIsAddingProduct] = useState(false)

  const allResourcesById = useMemo(
    () => new Map(resources.map((resource) => [resource.id, resource])),
    [resources],
  )
  const productsById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  )
  const recipesByProductId = useMemo(
    () => new Map(productRecipes.map((recipe) => [recipe.productId, recipe])),
    [productRecipes],
  )
  const actuallyAvailableKeys = useMemo(
    () => new Set(actuallyAvailableItems.map(getCargoItemKey)),
    [actuallyAvailableItems],
  )
  const exportedItemKeys = getExportedItemKeysAtOutpost(outpost.id, network)
  const importSummaries = getImportSummariesAtOutpost(outpost.id, network)

  const resolveItem = (item: CargoItem): ItemDisplay => {
    const reference = item.type === 'resource'
      ? allResourcesById.get(item.id)
      : productsById.get(item.id)

    return {
      name: reference?.name ?? item.id,
      shortName: reference?.shortName ?? item.id,
    }
  }

  const sortedResources = (category: Resource['category']) =>
    bodyResources
      .filter((resource) => resource.category === category)
      .sort((left, right) => left.name.localeCompare(right.name))

  const inorganicResources = sortedResources('inorganic')
  const organicResources = sortedResources('organic')
  const displayedManufacturing = draftManufacturing ?? outpost.manufacturing
  const sortedManufacturing = [...displayedManufacturing].sort((left, right) =>
    (productsById.get(left.productId)?.name ?? left.productId).localeCompare(
      productsById.get(right.productId)?.name ?? right.productId,
    ),
  )
  const draftProductIds = new Set(
    (draftManufacturing ?? []).map((entry) => entry.productId),
  )
  const addableProducts = products
    .filter((product) => !draftProductIds.has(product.id))
    .sort((left, right) => left.name.localeCompare(right.name))

  function beginManufacturingEdit() {
    setDraftManufacturing(outpost.manufacturing.map((entry) => ({ ...entry })))
  }

  function removeDraftProduct(productId: ProductId) {
    setDraftManufacturing((draft) =>
      draft?.filter((entry) => entry.productId !== productId) ?? null,
    )
  }

  function addDraftProduct(productId: ProductId) {
    if (!productId || !draftManufacturing || draftProductIds.has(productId)) {
      return
    }

    const originalEntry = outpost.manufacturing.find(
      (entry) => entry.productId === productId,
    )
    setDraftManufacturing([
      ...draftManufacturing,
      originalEntry ? { ...originalEntry } : { productId, quantity: 1 },
    ])
    setIsAddingProduct(false)
  }

  function renderResourceSection(
    heading: string,
    resources: Resource[],
  ) {
    if (resources.length === 0) {
      return null
    }

    return (
      <section className="outpost-status-matrix__section" aria-labelledby={`matrix-${heading.toLowerCase()}`}>
        <h3 id={`matrix-${heading.toLowerCase()}`} className="outpost-status-matrix__section-heading">
          {heading}
        </h3>

        {resources.map((resource) => {
          const isPresent = outpost.localResources.includes(resource.id)
          const isProducing = outpost.activeProduction.includes(resource.id)
          const cargoItem: CargoItem = { type: 'resource', id: resource.id }

          return (
            <div className="outpost-status-matrix__row" role="row" key={resource.id}>
              <div className="outpost-status-matrix__item" role="rowheader" title={resource.name}>
                {resource.name}
              </div>
              <div role="cell" />
              <div role="cell">
                <EditableState item={resource} pressed={isPresent} label="Toggle Present for" onClick={() => onToggleResource(resource.id)} />
              </div>
              <div role="cell">
                <EditableState item={resource} pressed={isProducing} disabled={!isPresent} label="Toggle Producing for" onClick={() => onToggleActiveProduction(resource.id)} />
              </div>
              <div role="cell" />
              <div role="cell">
                <ReadOnlyState item={resource} lit={exportedItemKeys.has(getCargoItemKey(cargoItem))} />
              </div>
            </div>
          )
        })}
      </section>
    )
  }

  return (
    <section className="outpost-status-matrix" aria-label="Outpost status matrix">
      <div className="outpost-status-matrix__scroll">
        <div className="outpost-status-matrix__table" role="table">
          <div className="outpost-status-matrix__header" role="row">
            {['Item', 'Source', 'Present', 'Producing', 'Inputs', 'Logistics'].map((heading) => (
              <div role="columnheader" key={heading}>{heading}</div>
            ))}
          </div>

          {renderResourceSection('Inorganic', inorganicResources)}
          {renderResourceSection('Organic', organicResources)}

          <section className="outpost-status-matrix__section" aria-labelledby="matrix-manufacturing">
            <div className="outpost-status-matrix__section-bar">
              <h3 id="matrix-manufacturing">Manufacturing</h3>
              <div className="outpost-status-matrix__actions">
                {draftManufacturing ? (
                  <>
                    <button type="button" onClick={() => {
                      onCommitManufacturing(draftManufacturing)
                      setDraftManufacturing(null)
                      setIsAddingProduct(false)
                    }}>save</button>
                    <button type="button" onClick={() => {
                      setDraftManufacturing(null)
                      setIsAddingProduct(false)
                    }}>cancel</button>
                    <button type="button" aria-label="Add manufactured product" onClick={() => setIsAddingProduct(true)}>+</button>
                  </>
                ) : (
                  <button type="button" onClick={beginManufacturingEdit}>edit</button>
                )}
              </div>
            </div>

            {draftManufacturing && isAddingProduct && (
              <label className="outpost-status-matrix__product-selector">
                <span>Add product</span>
                <select value="" autoFocus onChange={(event) => addDraftProduct(event.target.value)}>
                  <option value="">Select product...</option>
                  {addableProducts.map((product) => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
              </label>
            )}

            {sortedManufacturing.length === 0 ? (
              <p className="outpost-status-matrix__empty">No manufacturing recorded.</p>
            ) : sortedManufacturing.map((entry) => {
              const product = productsById.get(entry.productId)
              const display = { name: product?.name ?? entry.productId, shortName: product?.shortName ?? entry.productId }
              const recipe = recipesByProductId.get(entry.productId)
              const cargoItem: CargoItem = { type: 'product', id: entry.productId }

              return (
                <div className="outpost-status-matrix__row" role="row" key={entry.productId}>
                  <div className="outpost-status-matrix__item outpost-status-matrix__manufacturing-item" role="rowheader" title={display.name}>
                    {draftManufacturing && (
                      <button type="button" aria-label={`Remove ${display.name}`} title={`Remove ${display.name}`} onClick={() => removeDraftProduct(entry.productId)}>-</button>
                    )}
                    <span>{display.name}</span>
                  </div>
                  <div role="cell" />
                  <div role="cell" />
                  <div role="cell"><ReadOnlyState item={display} lit /></div>
                  <div className="outpost-status-matrix__state-list" role="cell">
                    {recipe?.ingredients.map((ingredient) => {
                      const ingredientItem: CargoItem = ingredient.item
                      return <ReadOnlyState key={getCargoItemKey(ingredientItem)} item={resolveItem(ingredientItem)} lit={actuallyAvailableKeys.has(getCargoItemKey(ingredientItem))} />
                    })}
                  </div>
                  <div role="cell"><ReadOnlyState item={display} lit={exportedItemKeys.has(getCargoItemKey(cargoItem))} /></div>
                </div>
              )
            })}
          </section>

          <section className="outpost-status-matrix__section" aria-labelledby="matrix-imports">
            <h3 id="matrix-imports" className="outpost-status-matrix__section-heading">Imports</h3>
            {importSummaries.length === 0 ? (
              <p className="outpost-status-matrix__empty">No imports.</p>
            ) : importSummaries.map((summary) => (
              <div className="outpost-status-matrix__row" role="row" key={summary.sourceOutpostId}>
                <div className="outpost-status-matrix__item" role="rowheader" title={summary.sourceOutpostName}>{summary.sourceOutpostName}</div>
                <div role="cell" />
                <div role="cell" />
                <div role="cell" />
                <div role="cell" />
                <div className="outpost-status-matrix__state-list" role="cell">
                  {[...summary.items]
                    .sort((left, right) => resolveItem(left).name.localeCompare(resolveItem(right).name))
                    .map((item) => <ReadOnlyState key={getCargoItemKey(item)} item={resolveItem(item)} lit />)}
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </section>
  )
}
