import {
  useEffect,
  useReducer,
  useState,
} from 'react'
import type {
  ProductId,
  ReferenceData,
} from './domain/referenceData'
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
  createNetworkEditingSession,
  networkEditingSessionReducer,
} from './domain/networkEditingSession'

import type {
  NetworkUpdate,
} from './domain/networkEditingSession'

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
  const [session, dispatchEditingSession] =
    useReducer(
      networkEditingSessionReducer,
      loadNetwork() ?? sampleNetwork,
      createNetworkEditingSession,
    )

  const network = session.network
  const history = session.history

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
   * Applies one user-visible network change and records it as one Undo step.
   *
   * The supplied update may change several related parts of the network.
   * History sees the complete operation as one semantic action.
   */
  function applyUndoableNetworkChange(
    label: string,
    update: NetworkUpdate,
  ) {
    dispatchEditingSession({
      type: 'apply',
      label,
      timestamp: Date.now(),
      update,
    })
  }

  /**
   * Applies a network change that has not yet been integrated with Undo/Redo.
   *
   * Resetting the editing session atomically replaces the network and clears
   * both history branches. This is temporary infrastructure while remaining
   * application actions are migrated onto the undoable-change gateway.
   */
  function applyUntrackedNetworkChange(
    update: NetworkUpdate,
  ) {
    dispatchEditingSession({
      type: 'reset',
      network: update(network),
    })
  }

  function updateCharacter(
    character: typeof network.character,
  ) {
    applyUntrackedNetworkChange(
      (currentNetwork) => ({
        ...currentNetwork,
        character,
      }),
    )
  }

  /**
   * Adds a new outpost and records the creation as one Undo step.
   *
   * Selection moves to the new outpost as presentation state, while the
   * persisted network addition is handled through the editing-session history.
   */
  function addOutpost() {
    const newOutpost = createDefaultOutpost()

    applyUndoableNetworkChange(
      'Add outpost',
      (currentNetwork) => ({
        ...currentNetwork,

        outposts: [
          ...currentNetwork.outposts,
          newOutpost,
        ],
      }),
    )

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

    const remainingOutposts =
      network.outposts.filter(
        (outpost) => outpost.id !== outpostId,
      )

    /*
    * Selection is presentation state rather than network history. Preserve
    * the existing navigation behaviour independently of the recorded network
    * mutation.
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

    applyUndoableNetworkChange(
      `Delete outpost ${deletedOutpost.name}`,
      (currentNetwork) => ({
        ...currentNetwork,

        outposts:
          currentNetwork.outposts.filter(
            (outpost) =>
              outpost.id !== outpostId,
          ),

        /*
        * Cargo links cannot survive removal of either endpoint's outpost.
        * Outbound cargo selections on surviving pads remain untouched.
        */
        cargoLinks:
          currentNetwork.cargoLinks.filter(
            (link) =>
              link.endpointA.outpostId !== outpostId &&
              link.endpointB.outpostId !== outpostId,
          ),
      }),
    )
  }

  /**
   * Adds a new unlinked cargo pad to one outpost and records the creation as
   * one Undo step.
   *
   * Cargo pads are created independently of cargo links. Their persisted
   * mutation is owned at the application layer so creation and deletion use
   * the same semantic history architecture.
   */
  function addCargoPad(
    outpostId: string,
  ) {
    const outpost =
      network.outposts.find(
        (candidate) =>
          candidate.id === outpostId,
      )

    if (!outpost) {
      return
    }

    const newCargoPad = {
      id: crypto.randomUUID(),
      label: `Pad ${outpost.cargoPads.length + 1}`,
      type: 'regular' as const,
      outboundItems: [],
    }

    applyUndoableNetworkChange(
      `Add ${outpost.name} / ${newCargoPad.label}`,
      (currentNetwork) => ({
        ...currentNetwork,

        outposts:
          currentNetwork.outposts.map(
            (candidateOutpost) =>
              candidateOutpost.id === outpostId
                ? {
                    ...candidateOutpost,
                    cargoPads: [
                      ...candidateOutpost.cargoPads,
                      newCargoPad,
                    ],
                  }
                : candidateOutpost,
          ),
      }),
    )
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

    applyUndoableNetworkChange(
      `Delete ${outpost.name} / ${cargoPad.label}`,
      (currentNetwork) =>
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
                    link.endpointA.outpostId ===
                      outpostId &&
                    link.endpointA.cargoPadId ===
                      cargoPadId
                  ) ||
                  (
                    link.endpointB.outpostId ===
                      outpostId &&
                    link.endpointB.cargoPadId ===
                      cargoPadId
                  )
                ),
            ),
        }),
    )
  }

  /**
   * Adds or removes one persistent outbound cargo selection from a specific
   * cargo pad and records the toggle as one Undo step.
   */
  function toggleCargoExport(
    outpostId: string,
    cargoPadId: string,
    item: CargoItem,
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

    const isCurrentlyExported =
      cargoPad.outboundItems.some(
        (outboundItem) =>
          outboundItem.type === item.type &&
          outboundItem.id === item.id,
      )

    const reference =
      item.type === 'resource'
        ? resources.find(
            (resource) =>
              resource.id === item.id,
          )
        : products.find(
            (product) =>
              product.id === item.id,
          )

    const itemName =
      reference?.name ?? item.id

    applyUndoableNetworkChange(
      isCurrentlyExported
        ? `Remove export ${itemName} from ${outpost.name} / ${cargoPad.label}`
        : `Add export ${itemName} to ${outpost.name} / ${cargoPad.label}`,
      (currentNetwork) =>
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

                return {
                  ...candidateOutpost,

                  cargoPads:
                    candidateOutpost.cargoPads.map(
                      (candidatePad) => {
                        if (
                          candidatePad.id !== cargoPadId
                        ) {
                          return candidatePad
                        }

                        return {
                          ...candidatePad,

                          outboundItems:
                            isCurrentlyExported
                              ? candidatePad.outboundItems.filter(
                                  (outboundItem) =>
                                    !(
                                      outboundItem.type ===
                                        item.type &&
                                      outboundItem.id ===
                                        item.id
                                    ),
                                )
                              : [
                                  ...candidatePad.outboundItems,
                                  item,
                                ],
                        }
                      },
                    ),
                }
              },
            ),
        }),
    )
  }

  /**
   * Toggles one cargo pad between regular and interstellar and records the
   * change as one Undo step.
   */
  function toggleCargoPadType(
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

    const nextType =
      cargoPad.type === 'regular'
        ? 'interstellar'
        : 'regular'

    applyUndoableNetworkChange(
      `Change ${outpost.name} / ${cargoPad.label} to ${nextType}`,
      (currentNetwork) => ({
        ...currentNetwork,

        outposts:
          currentNetwork.outposts.map(
            (candidateOutpost) =>
              candidateOutpost.id === outpostId
                ? {
                    ...candidateOutpost,

                    cargoPads:
                      candidateOutpost.cargoPads.map(
                        (candidatePad) =>
                          candidatePad.id === cargoPadId
                            ? {
                                ...candidatePad,
                                type: nextType,
                              }
                            : candidatePad,
                      ),
                  }
                : candidateOutpost,
          ),
      }),
    )
  }

  /**
   * Moves the editing session backward by one undoable user action.
   */
  function undo() {
    dispatchEditingSession({
      type: 'undo',
    })
  }

  /**
   * Moves the editing session forward by one previously undone user action.
   */
  function redo() {
    dispatchEditingSession({
      type: 'redo',
    })
  }

  function updateSelectedOutpost(
    field: 'name' | 'systemId',
    value: string,
  ) {
    applyUntrackedNetworkChange(
      (currentNetwork) => ({
        ...currentNetwork,

        outposts:
          currentNetwork.outposts.map(
            (outpost) => {
              if (
                outpost.id !== selectedOutpostId
              ) {
                return outpost
              }

              /*
              * Changing star system invalidates any previously selected body,
              * because planetary bodies belong to one specific system.
              *
              * System changes remain untracked for now because they are a
              * multi-effect action that will receive their own Undo/Redo pass.
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
                name: value,
              }
            },
          ),
      }),
    )
  }

  /**
   * Changes the selected outpost's planetary body and records the selection as
   * one Undo step.
   *
   * Body selection is a discrete action. Changing star system remains a
   * separate multi-effect action because it also clears the current body.
   */
  function updateSelectedOutpostBody(
    bodyId: string,
  ) {
    if (
      selectedOutpost.bodyId === bodyId
    ) {
      return
    }

    const body =
      referenceData?.bodies.find(
        (candidate) =>
          candidate.id === bodyId,
      )

    const label =
      bodyId
        ? `Change ${selectedOutpost.name} body to ${body?.name ?? bodyId}`
        : `Clear body for ${selectedOutpost.name}`

    applyUndoableNetworkChange(
      label,
      (currentNetwork) => ({
        ...currentNetwork,

        outposts:
          currentNetwork.outposts.map(
            (outpost) =>
              outpost.id === selectedOutpostId
                ? {
                    ...outpost,
                    bodyId,
                  }
                : outpost,
          ),
      }),
    )
  }

  function updateLocalResources(
    resourceIds: string[],
  ) {
    applyUntrackedNetworkChange(
      (currentNetwork) => ({
        ...currentNetwork,

        outposts:
          currentNetwork.outposts.map(
            (outpost) =>
              outpost.id === selectedOutpostId
                ? {
                    ...outpost,
                    localResources: resourceIds,
                    activeProduction:
                      outpost.activeProduction.filter(
                        (resourceId) =>
                          resourceIds.includes(
                            resourceId,
                          ),
                      ),
                  }
                : outpost,
          ),
      }),
    )
  }

  function updateActiveProduction(
    resourceIds: string[],
  ) {
    applyUntrackedNetworkChange(
      (currentNetwork) =>
        retireFulfilledPlannedSupply({
          ...currentNetwork,

          outposts:
            currentNetwork.outposts.map(
              (outpost) =>
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

  /**
   * Adds one manufactured product to the selected outpost and records the
   * addition as one Undo step.
   */
  function addManufacturingProduct(
    productId: ProductId,
  ) {
    const product =
      products.find(
        (candidate) =>
          candidate.id === productId,
      )

    applyUndoableNetworkChange(
      product
        ? `Add manufacturing ${product.name}`
        : `Add manufacturing ${productId}`,
      (currentNetwork) =>
        retireFulfilledPlannedSupply({
          ...currentNetwork,

          outposts:
            currentNetwork.outposts.map(
              (outpost) =>
                outpost.id === selectedOutpostId
                  ? {
                      ...outpost,

                      manufacturing: [
                        ...outpost.manufacturing,
                        {
                          productId,
                          quantity: 1,
                        },
                      ],
                    }
                  : outpost,
            ),
        }),
    )
  }

  /**
   * Removes one manufactured product from the selected outpost and records the
   * removal as one Undo step.
   */
  function removeManufacturingProduct(
    productId: ProductId,
  ) {
    const product =
      products.find(
        (candidate) =>
          candidate.id === productId,
      )

    applyUndoableNetworkChange(
      product
        ? `Remove manufacturing ${product.name}`
        : `Remove manufacturing ${productId}`,
      (currentNetwork) =>
        retireFulfilledPlannedSupply({
          ...currentNetwork,

          outposts:
            currentNetwork.outposts.map(
              (outpost) =>
                outpost.id === selectedOutpostId
                  ? {
                      ...outpost,

                      manufacturing:
                        outpost.manufacturing.filter(
                          (entry) =>
                            entry.productId !== productId,
                        ),
                    }
                  : outpost,
            ),
        }),
    )
  }

  /**
   * Updates the recorded number of fabricators for one manufactured product.
   *
   * Numeric editing is intentionally still untracked because it needs
   * coalescing so a multi-keystroke edit does not create multiple Undo steps.
   */
  function updateManufacturingQuantity(
    productId: ProductId,
    quantity: number,
  ) {
    applyUntrackedNetworkChange(
      (currentNetwork) =>
        retireFulfilledPlannedSupply({
          ...currentNetwork,

          outposts:
            currentNetwork.outposts.map(
              (outpost) =>
                outpost.id === selectedOutpostId
                  ? {
                      ...outpost,

                      manufacturing:
                        outpost.manufacturing.map(
                          (entry) =>
                            entry.productId === productId
                              ? {
                                  ...entry,
                                  quantity,
                                }
                              : entry,
                        ),
                    }
                  : outpost,
            ),
        }),
    )
  }

  /**
   * Adds or removes one Planned Supply item and records the toggle as one
   * Undo step.
   *
   * Planned Supply represents unresolved supply intent only. If a real source
   * later appears, normal reconciliation may retire the placeholder as part of
   * that separate user action.
   */
  function togglePlannedSupply(
    item: CargoItem,
  ) {
    const isCurrentlyPlanned =
      selectedOutpost.plannedSupply.some(
        (plannedItem) =>
          plannedItem.type === item.type &&
          plannedItem.id === item.id,
      )

    const reference =
      item.type === 'resource'
        ? resources.find(
            (resource) =>
              resource.id === item.id,
          )
        : products.find(
            (product) =>
              product.id === item.id,
          )

    const itemName =
      reference?.name ?? item.id

    applyUndoableNetworkChange(
      isCurrentlyPlanned
        ? `Remove Planned Supply ${itemName}`
        : `Add Planned Supply ${itemName}`,
      (currentNetwork) => ({
        ...currentNetwork,

        outposts:
          currentNetwork.outposts.map(
            (outpost) => {
              if (
                outpost.id !== selectedOutpostId
              ) {
                return outpost
              }

              return {
                ...outpost,

                plannedSupply:
                  isCurrentlyPlanned
                    ? outpost.plannedSupply.filter(
                        (plannedItem) =>
                          !(
                            plannedItem.type ===
                              item.type &&
                            plannedItem.id ===
                              item.id
                          ),
                      )
                    : [
                        ...outpost.plannedSupply,
                        item,
                      ],
              }
            },
          ),
      }),
    )
  }

  function updateCargoPads(
    cargoPads: typeof selectedOutpost.cargoPads,
  ) {
    applyUntrackedNetworkChange(
      (currentNetwork) =>
        retireFulfilledPlannedSupply({
          ...currentNetwork,

          outposts:
            currentNetwork.outposts.map(
              (outpost) =>
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

  function importNetwork(
    importedNetwork: OutpostNetwork,
  ) {
    dispatchEditingSession({
      type: 'reset',
      network: importedNetwork,
    })

    if (importedNetwork.outposts.length > 0) {
      setSelectedOutpostId(
        importedNetwork.outposts[0].id,
      )
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
            onBodyChange={updateSelectedOutpostBody}
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
              onAddProduct={addManufacturingProduct}
              onRemoveProduct={removeManufacturingProduct}
              onQuantityChange={updateManufacturingQuantity}
            />

            <PlannedSupplyEditor
              resources={resources}
              products={products}
              plannedSupply={selectedOutpost.plannedSupply ?? []}
              actuallyAvailableItems={actuallyAvailableItems}
              onTogglePlannedSupply={togglePlannedSupply}
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
            onAddCargoPad={() =>
              addCargoPad(
                selectedOutpost.id,
              )
            }
            onDeleteCargoPad={(cargoPadId) =>
              deleteCargoPad(
                selectedOutpost.id,
                cargoPadId,
              )
            }
            onToggleExport={(
              cargoPadId,
              item,
            ) =>
              toggleCargoExport(
                selectedOutpost.id,
                cargoPadId,
                item,
              )
            }
            onToggleCargoPadType={(cargoPadId) =>
              toggleCargoPadType(
                selectedOutpost.id,
                cargoPadId,
              )
            }
            onCargoLinksChange={(cargoLinks) => {
              applyUntrackedNetworkChange(
                (currentNetwork) =>
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