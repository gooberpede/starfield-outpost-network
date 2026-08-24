import { useEffect, useState } from 'react'
import type { ReferenceData } from './domain/referenceData'
import { loadReferenceData } from './data/referenceDataLoader'
import { sampleNetwork } from './domain/sampleData'
import { loadNetwork, saveNetwork } from './data/storage'
import { CharacterHeader } from './ui/components/CharacterHeader'
import { OutpostDetails } from './ui/components/OutpostDetails'
import { OutpostList } from './ui/components/OutpostList'
import { createDefaultOutpost } from './domain/defaults'
import {
  getActuallyAvailableItemsAtOutpost,
  getAvailableItemsAtOutpost,
} from './domain/availability'
import { ResourceEditor } from './ui/components/ResourceEditor'
import { ManufacturingEditor } from './ui/components/ManufacturingEditor'
import { PlannedSupplyEditor } from './ui/components/PlannedSupplyEditor'
import { CargoPadsEditor } from './ui/components/CargoPadsEditor'
import { NetworkExportButton } from './ui/components/NetworkExportButton'
import { NetworkImportButton } from './ui/components/NetworkImportButton'
import { HeaderLayout } from './ui/layout/HeaderLayout'
import { WorkspaceLayout } from './ui/layout/WorkspaceLayout'
import { AppFooter } from './ui/layout/AppFooter'
import { ValidationSummary } from './ui/components/ValidationSummary'

import {
  validateNetwork,
} from './domain/validation/validateNetwork'

import {
  getItemProvenanceAtOutpost,
} from './domain/provenance'

import type {
  ItemProvenance,
} from './domain/provenance'

import {
  createNetworkHistory,
  recordUndoableAction,
  redoNetworkChange,
  undoNetworkChange,
} from './domain/history'

import type {
  CargoItem,
  OutpostNetwork,
} from './domain/models'

/**
 * Removes Planned Supply entries that have acquired a real source.
 *
 * Planned Supply represents unresolved supply intent only. Once active local
 * production, manufacturing, or inbound cargo actually provides an item, the
 * planning placeholder has fulfilled its purpose and is retired.
 *
 * Downstream configuration such as cargo-pad exports is deliberately left
 * untouched.
 */
function retireFulfilledPlannedSupply(
  network: OutpostNetwork,
): OutpostNetwork {
  const outposts = network.outposts.map((outpost) => {
    const actuallyAvailableItems =
      getActuallyAvailableItemsAtOutpost(
        outpost.id,
        network,
      )

    const availableItemKeys =
      new Set(
        actuallyAvailableItems.map(
          (item) => `${item.type}:${item.id}`,
        ),
      )

    const plannedSupply =
      outpost.plannedSupply.filter(
        (item) =>
          !availableItemKeys.has(
            `${item.type}:${item.id}`,
          ),
      )

    /*
     * Preserve the original outpost object when nothing changed. Apart from
     * avoiding unnecessary object creation, this makes it clear that the
     * reconciliation modifies only fulfilled planning placeholders.
     */
    if (
      plannedSupply.length ===
      outpost.plannedSupply.length
    ) {
      return outpost
    }

    return {
      ...outpost,
      plannedSupply,
    }
  })

  return {
    ...network,
    outposts,
  }
}

function App() {
  const [network, setNetwork] = useState(() => {
    return loadNetwork() ?? sampleNetwork
  })

  const [history, setHistory] =
    useState(createNetworkHistory)

  const [referenceData, setReferenceData] =
    useState<ReferenceData | null>(null)

  const [referenceDataError, setReferenceDataError] =
    useState<string | null>(null)

  const resources = referenceData?.resources ?? []
  const products = referenceData?.products ?? []

  const [selectedOutpostId, setSelectedOutpostId] = useState(
    network.outposts[0].id,
  )

  const selectedOutpost =
    network.outposts.find((outpost) => outpost.id === selectedOutpostId) ??
    network.outposts[0]

  /**
   * Materials currently available at the selected outpost through active
   * production, manufacturing, or inbound cargo.
   *
   * This is derived from network state rather than stored separately.
   */
  const availableCargoItems =
    getAvailableItemsAtOutpost(
      selectedOutpost.id,
      network,
    )

  /**
   * Materials that already have a real source at the selected outpost.
   *
   * Planned Supply is intentionally excluded so the planning UI can offer only
   * items that still need a source.
   */
  const actuallyAvailableItems =
    getActuallyAvailableItemsAtOutpost(
      selectedOutpost.id,
      network,
    )

  /**
   * Current validation results for the recorded network.
   *
   * Validation is derived from network state rather than persisted. For now
   * every registered rule is enabled by default.
   */
  const validationIssues =
    validateNetwork(
      network,
      referenceData ?? undefined,
    )

  /**
   * Returns actual source provenance for one item at the selected outpost.
   *
   * The domain function works from the complete network, while downstream
   * cargo components receive only this narrow lookup capability.
   */
  function getSelectedOutpostItemProvenance(
    item: CargoItem,
  ): ItemProvenance {
    return getItemProvenanceAtOutpost(
      selectedOutpost.id,
      item,
      network,
    )
  }

  const bodyResources = referenceData?.bodyResources ?? []

  const selectedBodyResources =
    bodyResources.find(
      (entry) => entry.bodyId === selectedOutpost?.bodyId,
    )

  const selectedBodyResourceIds =
    selectedBodyResources?.resourceIds ?? []

  const availableLocalResources =
    resources.filter((resource) =>
      selectedBodyResourceIds.includes(resource.id),
  )

  /**
   * Loads the latest reference-data snapshot from the external JSON files.
   *
   * This is used both during application startup and by the manual reload
   * control, so the loading and error-handling behavior stays consistent.
   */
  async function reloadReferenceData() {
    try {
      const loadedReferenceData =
        await loadReferenceData()

      setReferenceData(loadedReferenceData)
      setReferenceDataError(null)
    } catch (error) {
      setReferenceData(null)

      setReferenceDataError(
        error instanceof Error
          ? error.message
          : 'Failed to load reference data.',
      )
    }
  }

  /**
   * Loads the external reference-data snapshot when the application starts.
   *
   * Reference data is kept separately from the player's saved network so
   * the catalogue can be refreshed or replaced without modifying their
   * recorded outposts.
   */
  useEffect(() => {
    void reloadReferenceData()
  }, [])

  useEffect(() => {
    saveNetwork(network)
  }, [network])

  /**
   * Clears session history before a network change that is not yet undoable.
   *
   * This prevents an old Undo/Redo snapshot from later replacing unrelated
   * edits made after that snapshot. As more user actions gain history support,
   * they can stop using this reset and record their own history entry instead.
   */
  function clearHistory() {
    setHistory(createNetworkHistory())
  }

  function updateCharacter(character: typeof network.character) {
    clearHistory()

    setNetwork((currentNetwork) => ({
      ...currentNetwork,
      character,
    }))
  }

  function addOutpost() {
    clearHistory()

    const newOutpost = createDefaultOutpost()

    setNetwork((currentNetwork) => ({
      ...currentNetwork,
      outposts: [...currentNetwork.outposts, newOutpost],
    }))

    setSelectedOutpostId(newOutpost.id)
  }

  /**
   * Deletes an outpost and removes cargo links that refer to it.
   *
   * The application currently assumes that a network always contains at
   * least one outpost, so the final remaining outpost cannot be deleted.
   *
   * If the deleted outpost is currently selected, selection moves to the
   * next surviving outpost where possible, otherwise to the previous one.
   */
  function deleteOutpost(outpostId: string) {
    if (network.outposts.length <= 1) {
      return
    }

    const deletedIndex =
      network.outposts.findIndex(
        (outpost) => outpost.id === outpostId,
      )

    if (deletedIndex === -1) {
      return
    }

    const deletedOutpost =
      network.outposts[deletedIndex]

    setHistory((currentHistory) =>
      recordUndoableAction(
        currentHistory,
        network,
        `Delete outpost ${deletedOutpost.name}`,
      ),
    )

    const remainingOutposts =
      network.outposts.filter(
        (outpost) => outpost.id !== outpostId,
      )

    /*
    * Preserve the current selection when deleting some other outpost.
    * When deleting the selected outpost, prefer the next item in the
    * existing ordering and fall back to the previous item at the end.
    */
    if (selectedOutpostId === outpostId) {
      const replacementIndex =
        Math.min(
          deletedIndex,
          remainingOutposts.length - 1,
        )

      setSelectedOutpostId(
        remainingOutposts[replacementIndex].id,
      )
    }

    setNetwork((currentNetwork) => ({
      ...currentNetwork,

      outposts:
        currentNetwork.outposts.filter(
          (outpost) => outpost.id !== outpostId,
        ),

      /*
      * Cargo links cannot survive removal of either endpoint's outpost.
      * Outbound cargo selections on surviving pads are left untouched.
      */
      cargoLinks:
        currentNetwork.cargoLinks.filter(
          (link) =>
            link.endpointA.outpostId !== outpostId &&
            link.endpointB.outpostId !== outpostId,
        ),
    }))
  }

  /**
   * Deletes one cargo pad and any network-level cargo link that refers to it.
   *
   * The entire operation is recorded as one history entry so Undo restores
   * both the cargo pad and any collateral cargo-link removal together.
   *
   * Remaining cargo pads are renumbered for presentation, while their stable
   * internal IDs remain unchanged.
   */
  function deleteCargoPad(
    outpostId: string,
    cargoPadId: string,
  ) {
    const outpost =
      network.outposts.find(
        (candidate) =>
          candidate.id === outpostId,
      )

    if (!outpost) {
      return
    }

    const cargoPad =
      outpost.cargoPads.find(
        (candidate) =>
          candidate.id === cargoPadId,
      )

    if (!cargoPad) {
      return
    }

    setHistory((currentHistory) =>
      recordUndoableAction(
        currentHistory,
        network,
        `Delete ${outpost.name} / ${cargoPad.label}`,
      ),
    )

    setNetwork((currentNetwork) =>
      retireFulfilledPlannedSupply({
        ...currentNetwork,

        outposts:
          currentNetwork.outposts.map(
            (candidateOutpost) => {
              if (
                candidateOutpost.id !== outpostId
              ) {
                return candidateOutpost
              }

              const remainingCargoPads =
                candidateOutpost.cargoPads
                  .filter(
                    (pad) =>
                      pad.id !== cargoPadId,
                  )
                  .map((pad, index) => ({
                    ...pad,
                    label: `Pad ${index + 1}`,
                  }))

              return {
                ...candidateOutpost,
                cargoPads: remainingCargoPads,
              }
            },
          ),

        cargoLinks:
          currentNetwork.cargoLinks.filter(
            (link) =>
              !(
                (
                  link.endpointA.outpostId === outpostId &&
                  link.endpointA.cargoPadId === cargoPadId
                ) ||
                (
                  link.endpointB.outpostId === outpostId &&
                  link.endpointB.cargoPadId === cargoPadId
                )
              ),
          ),
      }),
    )
  }

  /**
   * Restores the network snapshot immediately before the most recent
   * undoable action.
   */
  function undo() {
    const result =
      undoNetworkChange(
        history,
        network,
      )

    if (!result.network) {
      return
    }

    setHistory(result.history)
    setNetwork(result.network)

    /*
    * History currently records network state rather than presentation state.
    * Keep the current outpost selected when it still exists in the restored
    * snapshot; otherwise fall back to its first outpost.
    */
    if (
      !result.network.outposts.some(
        (outpost) =>
          outpost.id === selectedOutpostId,
      )
    ) {
      setSelectedOutpostId(
        result.network.outposts[0].id,
      )
    }
  }

  /**
   * Reapplies the most recently undone network change.
   */
  function redo() {
    const result =
      redoNetworkChange(
        history,
        network,
      )

    if (!result.network) {
      return
    }

    setHistory(result.history)
    setNetwork(result.network)

    if (
      !result.network.outposts.some(
        (outpost) =>
          outpost.id === selectedOutpostId,
      )
    ) {
      setSelectedOutpostId(
        result.network.outposts[0].id,
      )
    }
  }

  function updateSelectedOutpost(
    field: 'name' | 'systemId' | 'bodyId',
    value: string,
  ) {
    clearHistory()

    setNetwork((currentNetwork) => ({
      ...currentNetwork,
      outposts: currentNetwork.outposts.map((outpost) => {
        if (outpost.id !== selectedOutpostId) {
          return outpost
        }

        /*
        * Changing star system invalidates any previously selected body,
        * because planetary bodies belong to one specific system.
        */
        if (field === 'systemId') {
          return {
            ...outpost,
            systemId: value,
            bodyId: '',
          }
        }

        return {
          ...outpost,
          [field]: value,
        }
      }),
    }))
  }

  function updateLocalResources(resourceIds: string[]) {
    clearHistory()

    setNetwork((currentNetwork) => ({
      
      ...currentNetwork,
      outposts: currentNetwork.outposts.map((outpost) =>
        outpost.id === selectedOutpostId
          ? {
              ...outpost,
              localResources: resourceIds,
              activeProduction: outpost.activeProduction.filter(
                (resourceId) => resourceIds.includes(resourceId),
              ),
            }
          : outpost,
      ),
    }))
  }

  function updateActiveProduction(resourceIds: string[]) {
    clearHistory()

    setNetwork((currentNetwork) =>
      retireFulfilledPlannedSupply({
        ...currentNetwork,
        outposts: currentNetwork.outposts.map((outpost) =>
          outpost.id === selectedOutpostId
            ? {
                ...outpost,
                activeProduction: resourceIds,
              }
            : outpost,
        ),
      }),
    )
  }

  function updateManufacturing(
    entries: typeof selectedOutpost.manufacturing,
  ) {
    clearHistory()

    setNetwork((currentNetwork) =>
      retireFulfilledPlannedSupply({
        ...currentNetwork,
        outposts: currentNetwork.outposts.map((outpost) =>
          outpost.id === selectedOutpostId
            ? {
                ...outpost,
                manufacturing: entries,
              }
            : outpost,
        ),
      }),
    )
  }

  /**
   * Updates the selected outpost's persisted planning assumptions.
   *
   * Planned supply records items the player expects this outpost to receive,
   * independently of whether a real local or inbound source currently exists.
   */
  function updatePlannedSupply(
    plannedSupply: typeof selectedOutpost.plannedSupply,
  ) {
    clearHistory()
    
    setNetwork((currentNetwork) =>
      retireFulfilledPlannedSupply({
        ...currentNetwork,
        outposts: currentNetwork.outposts.map((outpost) =>
          outpost.id === selectedOutpostId
            ? {
                ...outpost,
                plannedSupply,
              }
            : outpost,
        ),
      }),
    )
  }

  function updateCargoPads(
    cargoPads: typeof selectedOutpost.cargoPads,
  ) {
    clearHistory()

    setNetwork((currentNetwork) =>
      retireFulfilledPlannedSupply({
        ...currentNetwork,
        outposts: currentNetwork.outposts.map((outpost) =>
          outpost.id === selectedOutpostId
            ? {
                ...outpost,
                cargoPads,
              }
            : outpost,
        ),
      }),
    )
  }

  function importNetwork(importedNetwork: OutpostNetwork) {
    clearHistory()

    setNetwork(importedNetwork)

    if (importedNetwork.outposts.length > 0) {
      setSelectedOutpostId(importedNetwork.outposts[0].id)
    }
  }

  return (
    <main>
      {/*
      * Character-level information remains above the workspace and therefore
      * spans the full application width.
      */}

      <HeaderLayout
        main={
          <CharacterHeader
            character={network.character}
            onChange={updateCharacter}
          />
        }
        actions={
          <>
            <button
              type="button"
              onClick={undo}
              disabled={history.past.length === 0}
              title={
                history.past.length > 0
                  ? `Undo: ${history.past.at(-1)?.label}`
                  : 'Nothing to undo'
              }
            >
              Undo
            </button>

            <button
              type="button"
              onClick={redo}
              disabled={history.future.length === 0}
              title={
                history.future.length > 0
                  ? `Redo: ${history.future.at(-1)?.label}`
                  : 'Nothing to redo'
              }
            >
              Redo
            </button>

            <NetworkExportButton network={network} />
            <NetworkImportButton onImport={importNetwork} />
          </>
        }
      />

      <hr />

      {/*
      * The main outpost workspace is divided into three independent regions:
      * navigation on the left, outpost editing in the middle, and cargo on
      * the right.
      *
      * WorkspaceLayout owns only the positioning. The feature components
      * themselves remain unaware of which column they occupy.
      */}
      <WorkspaceLayout
        left={
          <OutpostList
            outposts={network.outposts}
            selectedOutpostId={selectedOutpostId}
            onSelectOutpost={setSelectedOutpostId}
            onAddOutpost={addOutpost}
          />
        }

        top={
          <OutpostDetails
            outpost={selectedOutpost}
            systems={referenceData?.systems ?? []}
            bodies={referenceData?.bodies ?? []}
            onChange={updateSelectedOutpost}
            onDelete={() =>
              deleteOutpost(selectedOutpost.id)
            }
            canDelete={network.outposts.length > 1}
          />
        }

        middle={
          <>
            {selectedOutpost.bodyId && !selectedBodyResources && (
              <p>
                No resource reference data found for this body.
              </p>
            )}

            <ResourceEditor
              resources={availableLocalResources}
              selectedResourceIds={selectedOutpost.localResources}
              activeProductionIds={selectedOutpost.activeProduction}
              onChange={updateLocalResources}
              onActiveProductionChange={updateActiveProduction}
            />

            <ManufacturingEditor
              products={products}
              entries={selectedOutpost.manufacturing ?? []}
              onChange={updateManufacturing}
            />

            <PlannedSupplyEditor
              resources={resources}
              products={products}
              plannedSupply={selectedOutpost.plannedSupply ?? []}
              actuallyAvailableItems={actuallyAvailableItems}
              onChange={updatePlannedSupply}
            />
          </>
        }

        right={
          <CargoPadsEditor
            outpost={selectedOutpost}
            allOutposts={network.outposts}
            cargoLinks={network.cargoLinks}
            resources={resources}
            products={products}
            availableItems={availableCargoItems}
            getItemProvenance={getSelectedOutpostItemProvenance}
            onChange={updateCargoPads}
            onDeleteCargoPad={(cargoPadId) =>
              deleteCargoPad(
                selectedOutpost.id,
                cargoPadId,
              )
            }
            onCargoLinksChange={(cargoLinks) => {
              clearHistory()

              setNetwork((currentNetwork) =>
                retireFulfilledPlannedSupply({
                  ...currentNetwork,
                  cargoLinks,
                }),
              )
            }}
          />
        }
      />
      
      <AppFooter>
        <ValidationSummary
          issues={validationIssues}
          outposts={network.outposts}
          resources={resources}
          products={products}
        />

        <div>
          {referenceDataError && (
            <span>
              Reference data error: {referenceDataError}
            </span>
          )}

          {referenceData && (
            <span>
              Reference data loaded:{' '}
              {referenceData.systems.length} systems,{' '}
              {referenceData.bodies.length} bodies,{' '}
              {referenceData.resources.length} resources,{' '}
              {referenceData.products.length} products.
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => void reloadReferenceData()}
        >
          Reload Reference Data
        </button>
      </AppFooter>

    </main>
  )
}

export default App