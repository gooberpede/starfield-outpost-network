/**
 * Purpose: Present biome-aware resources, source routes, manufacturing, and logistics.
 * Architecture: Route rows are derived from reference data plus persisted recovery state.
 * Change this file when: matrix row or input presentation semantics change.
 */
import { useMemo, useState } from 'react'
import {
  getAvailableOrganicProductionRoutes,
  getOutpostAvailableInorganicResourceIds,
} from '../../domain/bodyResourceAvailability'
import {
  getCargoItemKey,
  getImportSummariesAtOutpost,
  getRoutedExportedItemKeysAtOutpost,
} from '../../domain/logistics'
import type {
  CargoItem,
  ManufacturingEntry,
  Outpost,
  OutpostNetwork,
  Product,
  Resource,
  ResourceProductionRoute,
} from '../../domain/models'
import {
  getOrganicRouteInputs,
  getProductionRouteKey,
} from '../../domain/productionRoutes'
import type { ProductId, ReferenceData, ResourceId } from '../../domain/referenceData'
import './OutpostStatusMatrix.css'

interface Props {
  outpost: Outpost
  network: OutpostNetwork
  resources: Resource[]
  referenceData: ReferenceData
  products: Product[]
  actuallyAvailableItems: CargoItem[]
  onToggleResource: (resourceId: ResourceId) => void
  onToggleActiveProduction: (route: ResourceProductionRoute) => void
  onCommitManufacturing: (entries: ManufacturingEntry[]) => void
}

interface ItemDisplay { name: string; shortName: string }

function ReadOnlyState({ item, lit }: {
  item: ItemDisplay; lit: boolean
}) {
  return <span
    className="outpost-status-matrix__state"
    data-state={lit ? 'lit' : 'dimmed'}
    title={item.name}
    aria-label={`${item.name}: ${lit ? 'active' : 'inactive'}`}
    tabIndex={0}
  >{item.shortName}</span>
}

function EditableState({ item, pressed, disabled = false, label, onClick }: {
  item: ItemDisplay; pressed: boolean; disabled?: boolean; label: string; onClick: () => void
}) {
  return <button
    className="outpost-status-matrix__state outpost-status-matrix__state--editable"
    type="button" aria-pressed={pressed} aria-label={`${label} ${item.name}`}
    title={item.name} disabled={disabled} onClick={onClick}
  >{item.shortName}</button>
}

export function OutpostStatusMatrix({
  outpost, network, resources, referenceData, products, actuallyAvailableItems,
  onToggleResource, onToggleActiveProduction, onCommitManufacturing,
}: Props) {
  const [draftManufacturing, setDraftManufacturing] = useState<ManufacturingEntry[] | null>(null)
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const resourcesById = useMemo(() => new Map(resources.map((item) => [item.id, item])), [resources])
  const productsById = useMemo(() => new Map(products.map((item) => [item.id, item])), [products])
  const recipesByProductId = useMemo(() => new Map(
    referenceData.productRecipes.map((recipe) => [recipe.productId, recipe]),
  ), [referenceData.productRecipes])
  const actuallyAvailableKeys = useMemo(() => new Set(
    actuallyAvailableItems.map(getCargoItemKey),
  ), [actuallyAvailableItems])
  const exportedItemKeys = getRoutedExportedItemKeysAtOutpost(outpost.id, network)
  const importSummaries = getImportSummariesAtOutpost(outpost.id, network)
  const availableInorganicIds = new Set(getOutpostAvailableInorganicResourceIds(
    referenceData, outpost.bodyId, outpost.selectedBiomeIds,
  ))
  const inorganicIds = new Set([
    ...availableInorganicIds,
    ...outpost.activeProduction.filter((route) => route.type === 'inorganic')
      .map((route) => route.resourceId),
  ])
  const inorganicRows = [...inorganicIds].sort((left, right) =>
    (resourcesById.get(left)?.name ?? left).localeCompare(resourcesById.get(right)?.name ?? right))

  const availableOrganicRoutes = getAvailableOrganicProductionRoutes(
    referenceData, outpost.bodyId, outpost.selectedBiomeIds,
  )
  const availableOrganicKeys = new Set(availableOrganicRoutes.map(getProductionRouteKey))
  const organicRoutesByKey = new Map<string, ResourceProductionRoute>()
  for (const route of [...availableOrganicRoutes, ...outpost.activeProduction.filter(
    (candidate) => candidate.type !== 'inorganic',
  )]) organicRoutesByKey.set(getProductionRouteKey(route), route)
  const classOrder = new Map([['plant', 0], ['herbivore', 1], ['carnivore', 2]])
  const getPlanetSpecies = (route: ResourceProductionRoute) => route.type === 'organic'
    ? referenceData.planetSpecies.find((entry) =>
      entry.bodyId === outpost.bodyId && entry.speciesId === route.speciesId) : undefined
  const organicRows = [...organicRoutesByKey.values()].sort((left, right) => {
    if (left.type === 'organic-unspecified' || right.type === 'organic-unspecified') {
      if (left.type !== right.type) return left.type === 'organic-unspecified' ? -1 : 1
    }
    const leftClass = classOrder.get(getPlanetSpecies(left)?.sourceClass ?? '') ?? 99
    const rightClass = classOrder.get(getPlanetSpecies(right)?.sourceClass ?? '') ?? 99
    return leftClass - rightClass ||
      (resourcesById.get(left.resourceId)?.name ?? left.resourceId).localeCompare(
        resourcesById.get(right.resourceId)?.name ?? right.resourceId) ||
      (left.type === 'organic'
        ? referenceData.species.find((entry) => entry.id === left.speciesId)?.name ?? left.speciesId : '')
        .localeCompare(right.type === 'organic'
          ? referenceData.species.find((entry) => entry.id === right.speciesId)?.name ?? right.speciesId : '')
  })

  const resolveItem = (item: CargoItem): ItemDisplay => {
    const reference = item.type === 'resource' ? resourcesById.get(item.id) : productsById.get(item.id)
    return { name: reference?.name ?? item.id, shortName: reference?.shortName ?? item.id }
  }
  const routeIsActive = (route: ResourceProductionRoute) =>
    outpost.activeProduction.some((candidate) => getProductionRouteKey(candidate) === getProductionRouteKey(route))
  const displayedManufacturing = draftManufacturing ?? outpost.manufacturing
  const sortedManufacturing = [...displayedManufacturing].sort((left, right) =>
    (productsById.get(left.productId)?.name ?? left.productId).localeCompare(
      productsById.get(right.productId)?.name ?? right.productId))
  const draftProductIds = new Set((draftManufacturing ?? []).map((entry) => entry.productId))
  const addableProducts = products.filter((product) => !draftProductIds.has(product.id))
    .sort((left, right) => left.name.localeCompare(right.name))
  const beginManufacturingEdit = () => setDraftManufacturing(
    outpost.manufacturing.map((entry) => ({ ...entry })),
  )
  const removeDraftProduct = (productId: ProductId) => setDraftManufacturing(
    (draft) => draft?.filter((entry) => entry.productId !== productId) ?? null,
  )
  function addDraftProduct(productId: ProductId) {
    if (!productId || !draftManufacturing || draftProductIds.has(productId)) return
    const original = outpost.manufacturing.find((entry) => entry.productId === productId)
    setDraftManufacturing([...draftManufacturing, original ? { ...original } : { productId, quantity: 1 }])
    setIsAddingProduct(false)
  }

  return <section className="outpost-status-matrix" aria-label="Outpost status matrix">
    <h2>Resource Matrix</h2>
    <div className="outpost-status-matrix__scroll technical-scrollbar"><div className="outpost-status-matrix__table" role="table">
      <div className="outpost-status-matrix__header" role="row">
        {['Item', 'Source', 'Present', 'Producing', 'Inputs', 'Logistics'].map((heading) =>
          <div role="columnheader" key={heading}>{heading}</div>)}
      </div>

      {inorganicRows.length > 0 && <section className="outpost-status-matrix__section" aria-labelledby="matrix-inorganic">
        <h3 id="matrix-inorganic" className="outpost-status-matrix__section-heading">Inorganic</h3>
        {inorganicRows.map((resourceId) => {
          const resource = resourcesById.get(resourceId)
          const display = { name: resource?.name ?? resourceId, shortName: resource?.shortName ?? resourceId }
          const route: ResourceProductionRoute = { type: 'inorganic', resourceId }
          const producing = routeIsActive(route)
          const present = outpost.localResources.includes(resourceId)
          const cargoItem: CargoItem = { type: 'resource', id: resourceId }
          return <div className="outpost-status-matrix__row" role="row" key={getProductionRouteKey(route)}>
            <div className="outpost-status-matrix__item" role="rowheader" title={display.name}>{display.name}</div>
            <div role="cell" />
            <div role="cell"><EditableState item={display} pressed={present} label="Toggle Present for"
              onClick={() => onToggleResource(resourceId)} /></div>
            <div role="cell"><EditableState item={display} pressed={producing}
              disabled={!present && !producing} label="Toggle Producing for"
              onClick={() => onToggleActiveProduction(route)} /></div>
            <div role="cell" />
            <div role="cell"><ReadOnlyState item={display}
              lit={exportedItemKeys.has(getCargoItemKey(cargoItem))} /></div>
          </div>
        })}
      </section>}

      {organicRows.length > 0 && <section className="outpost-status-matrix__section" aria-labelledby="matrix-organic">
        <h3 id="matrix-organic" className="outpost-status-matrix__section-heading">Organic</h3>
        {organicRows.map((route) => {
          const resource = resourcesById.get(route.resourceId)
          const display = { name: resource?.name ?? route.resourceId, shortName: resource?.shortName ?? route.resourceId }
          const source = route.type === 'organic'
            ? referenceData.species.find((entry) => entry.id === route.speciesId)?.name ?? route.speciesId
            : 'Unspecified'
          const present = availableOrganicKeys.has(getProductionRouteKey(route))
          const producing = routeIsActive(route)
          const cargoItem: CargoItem = { type: 'resource', id: route.resourceId }
          const inputs = present ? getOrganicRouteInputs(referenceData, outpost.bodyId, route) : []
          return <div className="outpost-status-matrix__row" role="row" key={getProductionRouteKey(route)}>
            <div className="outpost-status-matrix__item" role="rowheader" title={display.name}>{display.name}</div>
            <div className="outpost-status-matrix__item" role="cell" title={source}>{source}</div>
            <div role="cell"><ReadOnlyState item={display} lit={present} /></div>
            <div role="cell"><EditableState item={display} pressed={producing}
              disabled={!present && !producing} label={`Toggle Producing from ${source} for`}
              onClick={() => onToggleActiveProduction(route)} /></div>
            <div className="outpost-status-matrix__state-list" role="cell">
              {inputs.map((input) => {
                const item: CargoItem = { type: 'resource', id: input.resourceId }
                return <ReadOnlyState key={input.resourceId} item={resolveItem(item)}
                  lit={actuallyAvailableKeys.has(getCargoItemKey(item))} />
              })}
            </div>
            <div role="cell"><ReadOnlyState item={display}
              lit={exportedItemKeys.has(getCargoItemKey(cargoItem))} /></div>
          </div>
        })}
      </section>}

      <section className="outpost-status-matrix__section" aria-labelledby="matrix-manufacturing">
        <div className="outpost-status-matrix__section-bar"><h3 id="matrix-manufacturing">Manufacturing</h3>
          <div className="outpost-status-matrix__actions">{draftManufacturing ? <>
            <button type="button" onClick={() => { onCommitManufacturing(draftManufacturing); setDraftManufacturing(null); setIsAddingProduct(false) }}>save</button>
            <button type="button" onClick={() => { setDraftManufacturing(null); setIsAddingProduct(false) }}>cancel</button>
            <button type="button" aria-label="Add manufactured product" onClick={() => setIsAddingProduct(true)}>+</button>
          </> : <button type="button" onClick={beginManufacturingEdit}>edit</button>}</div>
        </div>
        {draftManufacturing && isAddingProduct && <label className="outpost-status-matrix__product-selector">
          <span>Add product</span><select value="" autoFocus onChange={(event) => addDraftProduct(event.target.value)}>
            <option value="">Select product...</option>{addableProducts.map((product) =>
              <option key={product.id} value={product.id}>{product.name}</option>)}
          </select></label>}
        {sortedManufacturing.length === 0 ? <p className="outpost-status-matrix__empty">No manufacturing recorded.</p>
          : sortedManufacturing.map((entry) => {
            const product = productsById.get(entry.productId)
            const display = { name: product?.name ?? entry.productId, shortName: product?.shortName ?? entry.productId }
            const cargoItem: CargoItem = { type: 'product', id: entry.productId }
            return <div className="outpost-status-matrix__row" role="row" key={entry.productId}>
              <div className="outpost-status-matrix__item outpost-status-matrix__manufacturing-item" role="rowheader" title={display.name}>
                {draftManufacturing && <button type="button" aria-label={`Remove ${display.name}`}
                  title={`Remove ${display.name}`} onClick={() => removeDraftProduct(entry.productId)}>-</button>}
                <span>{display.name}</span></div><div role="cell" /><div role="cell" />
              <div role="cell"><ReadOnlyState item={display} lit /></div>
              <div className="outpost-status-matrix__state-list" role="cell">
                {recipesByProductId.get(entry.productId)?.ingredients.map((ingredient) => {
                  const item: CargoItem = ingredient.item
                  return <ReadOnlyState key={getCargoItemKey(item)} item={resolveItem(item)}
                    lit={actuallyAvailableKeys.has(getCargoItemKey(item))} />
                })}
              </div><div role="cell"><ReadOnlyState item={display}
                lit={exportedItemKeys.has(getCargoItemKey(cargoItem))} /></div>
            </div>
          })}
      </section>

      <section className="outpost-status-matrix__section" aria-labelledby="matrix-imports">
        <h3 id="matrix-imports" className="outpost-status-matrix__section-heading">Imports</h3>
        {importSummaries.length === 0 ? <p className="outpost-status-matrix__empty">No imports.</p>
          : importSummaries.map((summary) => <div className="outpost-status-matrix__row" role="row" key={summary.sourceOutpostId}>
            <div className="outpost-status-matrix__item" role="rowheader" title={summary.sourceOutpostName}>{summary.sourceOutpostName}</div>
            <div role="cell" /><div role="cell" /><div role="cell" /><div role="cell" />
            <div className="outpost-status-matrix__state-list" role="cell">{[...summary.items]
              .sort((left, right) => resolveItem(left).name.localeCompare(resolveItem(right).name))
              .map((item) => <ReadOnlyState key={getCargoItemKey(item)} item={resolveItem(item)} lit />)}</div>
          </div>)}
      </section>
    </div></div>
  </section>
}
