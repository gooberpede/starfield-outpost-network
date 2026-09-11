/**
 * Purpose: Present biome-aware resources, source routes, manufacturing, and logistics.
 * Architecture: Route rows are derived from reference data plus persisted recovery state.
 * Change this file when: matrix row or input presentation semantics change.
 */
import { useMemo, useState, type ReactNode } from 'react'
import {
  getAvailableOrganicProductionRoutes,
  getOutpostAvailableInorganicResourceIds,
} from '../../domain/bodyResourceAvailability'
import {
  canActivateProductionRoute,
  canAddExplicitResourcePresence,
  getInorganicMatrixResourceIds,
  isResourcePresentAtOutpost,
  usesExplicitPresence,
  X_TECH_RESOURCE_ID,
} from '../../domain/resourcePresence.ts'
import {
  getCargoItemKey,
  getImportSummariesAtOutpost,
  getRoutedExportDestinationNamesAtOutpost,
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
import { contextHelpText } from '../contextHelpText'
import {
  getExportTooltip,
  getExplicitResourceAddTooltip,
  getExplicitResourcePresentTooltip,
  getImportTooltip,
  getInorganicPresentTooltip,
  getInputTooltip,
  getManufacturingProducingTooltip,
  getOrganicPresentTooltip,
  getProducingTooltip,
} from '../statusTooltips'
import { ContextHelp } from './ContextHelp'
import './OutpostStatusMatrix.css'
import { useLocalization } from '../../localization/LocalizationContext.ts'
import { getReferenceDisplayName } from '../../localization/referenceNames.ts'
import {
  getManufacturingProducingState,
  type ManufacturingProducingState,
} from '../statusStates.ts'

interface Props {
  headingControl?: ReactNode
  outpost: Outpost
  network: OutpostNetwork
  resources: Resource[]
  referenceData: ReferenceData
  products: Product[]
  availableItems: CargoItem[]
  actuallyAvailableItems: CargoItem[]
  onToggleResource: (resourceId: ResourceId) => void
  onToggleExplicitResourcePresence: (resourceId: ResourceId) => void
  onToggleActiveProduction: (route: ResourceProductionRoute) => void
  onCommitManufacturing: (entries: ManufacturingEntry[]) => void
}

interface ItemDisplay { name: string; shortName: string }

function ReadOnlyState({ item, lit, state, title = item.name }: {
  item: ItemDisplay
  lit: boolean
  state?: ManufacturingProducingState
  title?: string
}) {
  return <span
    className="outpost-status-matrix__state"
    data-state={state ?? (lit ? 'lit' : 'dimmed')}
    title={title}
    aria-label={`${item.name}: ${lit ? 'active' : 'inactive'}`}
    tabIndex={0}
  >{item.shortName}</span>
}

function EditableState({ item, pressed, disabled = false, label, title = item.name, onClick }: {
  item: ItemDisplay; pressed: boolean; disabled?: boolean; label: string; title?: string; onClick: () => void
}) {
  return <button
    className="outpost-status-matrix__state outpost-status-matrix__state--editable"
    type="button" aria-pressed={pressed} aria-label={`${label} ${item.name}`}
    title={title} disabled={disabled} onClick={onClick}
  >{item.shortName}</button>
}

export function OutpostStatusMatrix({
  headingControl,
  outpost, network, resources, referenceData, products, actuallyAvailableItems,
  availableItems,
  onToggleResource, onToggleExplicitResourcePresence, onToggleActiveProduction, onCommitManufacturing,
}: Props) {
  const { locale, t } = useLocalization()
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
  const availableKeys = useMemo(() => new Set(
    availableItems.map(getCargoItemKey),
  ), [availableItems])
  const exportedItemKeys = getRoutedExportedItemKeysAtOutpost(outpost.id, network)
  const exportDestinationNames = getRoutedExportDestinationNamesAtOutpost(outpost.id, network)
  const importSummaries = getImportSummariesAtOutpost(outpost.id, network)
  const availableInorganicIds = new Set(getOutpostAvailableInorganicResourceIds(
    referenceData, outpost.bodyId, outpost.selectedBiomeIds,
  ))
  const inorganicIds = getInorganicMatrixResourceIds(outpost, referenceData)
  const ordinaryInorganicRows = inorganicIds.filter((id) => !usesExplicitPresence(id)).sort((left, right) =>
    getReferenceDisplayName('resource', left, resourcesById.get(left)?.name, locale)
      .localeCompare(getReferenceDisplayName(
        'resource', right, resourcesById.get(right)?.name, locale,
      )))
  const inorganicRows = [
    ...ordinaryInorganicRows,
    ...inorganicIds.filter((id) => usesExplicitPresence(id)),
  ]
  const canAddXTech = canAddExplicitResourcePresence(network.character, X_TECH_RESOURCE_ID) &&
    !(outpost.explicitResourcePresence ?? []).includes(X_TECH_RESOURCE_ID) &&
    !inorganicRows.includes(X_TECH_RESOURCE_ID)
  const xTech = resourcesById.get(X_TECH_RESOURCE_ID)
  const xTechDisplayName = getReferenceDisplayName(
    'resource', X_TECH_RESOURCE_ID, xTech?.name, locale,
  )

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
    return {
      name: getReferenceDisplayName(item.type, item.id, reference?.name, locale),
      shortName: reference?.shortName ?? item.id,
    }
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
    <div className="outpost-status-matrix__heading-strip">
      <h2>Resource Matrix</h2>
      {headingControl}
    </div>
    <div className="outpost-status-matrix__scroll technical-scrollbar"><div className="outpost-status-matrix__table" role="table">
      <div className="outpost-status-matrix__header" role="row">
        <div role="columnheader">Item</div>
        <div role="columnheader">Source</div>
        <div role="columnheader" className="outpost-status-matrix__help-heading">
          Present
          <ContextHelp context="Present column" text={contextHelpText.present} />
        </div>
        <div role="columnheader" className="outpost-status-matrix__help-heading">
          Producing
          <ContextHelp context="Producing column" text={contextHelpText.producing} />
        </div>
        <div role="columnheader">Inputs</div>
        <div role="columnheader" className="outpost-status-matrix__help-heading">
          Logistics
          <ContextHelp context="Logistics column" text={contextHelpText.logistics} />
        </div>
      </div>

      {(inorganicRows.length > 0 || canAddXTech) && <section className="outpost-status-matrix__section" aria-labelledby="matrix-inorganic">
        <div className="outpost-status-matrix__section-bar outpost-status-matrix__section-bar--matrix">
          <h3 id="matrix-inorganic">Inorganic</h3>
          {canAddXTech && <button type="button" className="outpost-status-matrix__add-explicit"
            title={getExplicitResourceAddTooltip(xTechDisplayName, locale)}
            aria-label={t('matrix.action.xTech.add', { resource: xTechDisplayName })}
            onClick={() => onToggleExplicitResourcePresence(X_TECH_RESOURCE_ID)}>
            + {xTechDisplayName}
          </button>}
        </div>
        {inorganicRows.map((resourceId) => {
          const resource = resourcesById.get(resourceId)
          const display = {
            name: getReferenceDisplayName('resource', resourceId, resource?.name, locale),
            shortName: resource?.shortName ?? resourceId,
          }
          const route: ResourceProductionRoute = { type: 'inorganic', resourceId }
          const producing = routeIsActive(route)
          const explicit = usesExplicitPresence(resourceId)
          const present = isResourcePresentAtOutpost(resourceId, outpost, referenceData)
          const canAddExplicit = canAddExplicitResourcePresence(network.character, resourceId)
          const cargoItem: CargoItem = { type: 'resource', id: resourceId }
          return <div className="outpost-status-matrix__row" role="row" key={getProductionRouteKey(route)}>
            <div className="outpost-status-matrix__item" role="rowheader" title={display.name}>{display.name}</div>
            <div role="cell" />
            <div role="cell"><EditableState item={display} pressed={present}
              disabled={explicit && !present && !canAddExplicit} label="Toggle Present for"
              title={explicit
                ? present
                  ? getExplicitResourcePresentTooltip(display.name, locale)
                  : getExplicitResourceAddTooltip(display.name, locale)
                : getInorganicPresentTooltip(
                    display.name,
                    present,
                    availableInorganicIds.has(resourceId),
                    locale,
                  )}
              onClick={() => explicit
                ? onToggleExplicitResourcePresence(resourceId)
                : onToggleResource(resourceId)} /></div>
            <div role="cell"><EditableState item={display} pressed={producing}
              disabled={!producing && !canActivateProductionRoute(
                network.character, outpost, route, referenceData,
              )} label="Toggle Producing for"
              title={getProducingTooltip(display.name, producing, locale)}
              onClick={() => onToggleActiveProduction(route)} /></div>
            <div role="cell" />
            <div role="cell"><ReadOnlyState item={display}
              lit={exportedItemKeys.has(getCargoItemKey(cargoItem))}
              title={getExportTooltip(
                display.name,
                exportDestinationNames.get(getCargoItemKey(cargoItem)) ?? [],
                locale,
              )} /></div>
          </div>
        })}
      </section>}

      {organicRows.length > 0 && <section className="outpost-status-matrix__section" aria-labelledby="matrix-organic">
        <h3 id="matrix-organic" className="outpost-status-matrix__section-heading">Organic</h3>
        {organicRows.map((route) => {
          const resource = resourcesById.get(route.resourceId)
          const display = {
            name: getReferenceDisplayName('resource', route.resourceId, resource?.name, locale),
            shortName: resource?.shortName ?? route.resourceId,
          }
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
            <div role="cell"><ReadOnlyState
              item={display}
              lit={present}
              title={getOrganicPresentTooltip(
                display.name,
                route,
                present,
                referenceData,
                outpost.bodyId,
                outpost.selectedBiomeIds,
              )}
            /></div>
            <div role="cell"><EditableState item={display} pressed={producing}
              disabled={!present && !producing} label={`Toggle Producing from ${source} for`}
              title={getProducingTooltip(display.name, producing, locale)}
              onClick={() => onToggleActiveProduction(route)} /></div>
            <div className="outpost-status-matrix__state-list" role="cell">
              {inputs.map((input) => {
                const item: CargoItem = { type: 'resource', id: input.resourceId }
                const inputDisplay = resolveItem(item)
                const available = actuallyAvailableKeys.has(getCargoItemKey(item))
                return <ReadOnlyState key={input.resourceId} item={inputDisplay}
                  lit={available}
                  title={getInputTooltip(inputDisplay.name, available, locale)} />
              })}
            </div>
            <div role="cell"><ReadOnlyState item={display}
              lit={exportedItemKeys.has(getCargoItemKey(cargoItem))}
              title={getExportTooltip(
                display.name,
                exportDestinationNames.get(getCargoItemKey(cargoItem)) ?? [],
                locale,
              )} /></div>
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
            const display = {
              name: getReferenceDisplayName('product', entry.productId, product?.name, locale),
              shortName: product?.shortName ?? entry.productId,
            }
            const cargoItem: CargoItem = { type: 'product', id: entry.productId }
            const producingState = getManufacturingProducingState(
              entry.productId,
              actuallyAvailableItems,
            )
            return <div className="outpost-status-matrix__row" role="row" key={entry.productId}>
              <div className="outpost-status-matrix__item outpost-status-matrix__item--span-source outpost-status-matrix__manufacturing-item" role="rowheader" title={display.name}>
                {draftManufacturing && <button type="button" aria-label={`Remove ${display.name}`}
                  title={`Remove ${display.name}`} onClick={() => removeDraftProduct(entry.productId)}>-</button>}
                <span>{display.name}</span></div>
              <div className="outpost-status-matrix__cell--present" role="cell" />
              <div className="outpost-status-matrix__cell--producing" role="cell"><ReadOnlyState item={display}
                lit={producingState === 'producing'}
                state={producingState}
                title={getManufacturingProducingTooltip(display.name, producingState, locale)} /></div>
              <div className="outpost-status-matrix__cell--inputs outpost-status-matrix__state-list" role="cell">
                {recipesByProductId.get(entry.productId)?.ingredients.map((ingredient) => {
                  const item: CargoItem = ingredient.item
                  const inputDisplay = resolveItem(item)
                  const available = availableKeys.has(getCargoItemKey(item))
                  return <ReadOnlyState key={getCargoItemKey(item)} item={inputDisplay}
                    lit={available}
                    title={getInputTooltip(inputDisplay.name, available, locale)} />
                })}
              </div><div className="outpost-status-matrix__cell--logistics" role="cell"><ReadOnlyState item={display}
                lit={exportedItemKeys.has(getCargoItemKey(cargoItem))}
                title={getExportTooltip(
                  display.name,
                  exportDestinationNames.get(getCargoItemKey(cargoItem)) ?? [],
                  locale,
                )} /></div>
            </div>
          })}
      </section>

      <section className="outpost-status-matrix__section" aria-labelledby="matrix-imports">
        <h3 id="matrix-imports" className="outpost-status-matrix__section-heading">Imports</h3>
        {importSummaries.length === 0 ? <p className="outpost-status-matrix__empty">No imports.</p>
          : importSummaries.map((summary) => <div className="outpost-status-matrix__row" role="row" key={summary.sourceOutpostId}>
            <div className="outpost-status-matrix__item outpost-status-matrix__item--span-source" role="rowheader" title={summary.sourceOutpostName}>{summary.sourceOutpostName}</div>
            <div className="outpost-status-matrix__cell--present" role="cell" />
            <div className="outpost-status-matrix__cell--producing" role="cell" />
            <div className="outpost-status-matrix__cell--inputs" role="cell" />
            <div className="outpost-status-matrix__cell--logistics outpost-status-matrix__state-list" role="cell">{[...summary.items]
              .sort((left, right) => resolveItem(left).name.localeCompare(resolveItem(right).name))
              .map((item) => {
                const display = resolveItem(item)
                return <ReadOnlyState key={getCargoItemKey(item)} item={display} lit
                  title={getImportTooltip(display.name, locale)} />
              })}</div>
          </div>)}
      </section>
    </div></div>
  </section>
}
