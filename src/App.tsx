import { getBiomeButtonGroups } from './domain/bodyResourceAvailability'
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import type {
  ReferenceData,
  BodyBiomeId,
} from './domain/referenceData'
import {
  initializeNetworkCollection,
  trySaveNetworkCollection,
} from './data/storage'
import type { PersistenceStatus } from './data/storage'
import {
  getActiveSavedNetwork,
  getNextNetworkId,
  getPreviousNetworkId,
} from './data/networkCollection'
import type { NetworkCollection } from './data/networkCollection'
import { CharacterHeader } from './ui/components/CharacterHeader'
import { OutpostDetails } from './ui/components/OutpostDetails'
import { OutpostList } from './ui/components/OutpostList'
import {
  createDefaultOutpost,
} from './domain/defaults'
import {
  getCargoPadLimit,
  getOutpostLimit,
} from './domain/capacity'
import {
  getActuallyAvailableItemsAtOutpost,
  getAvailableItemsAtOutpost,
  retireFulfilledPlannedSupply,
} from './domain/availability'
import { OutpostStatusMatrix } from './ui/components/OutpostStatusMatrix'
import { SearchForItems } from './ui/components/SearchForItems'
import { PlannedSupplyEditor } from './ui/components/PlannedSupplyEditor'
import { CargoPadsEditor } from './ui/components/CargoPadsEditor'
import { NetworkExportButton } from './ui/components/NetworkExportButton'
import { NetworkImportButton } from './ui/components/NetworkImportButton'
import { TitleBar } from './ui/layout/TitleBar'
import { PageHeader } from './ui/layout/PageHeader'
import { WorkspaceLayout } from './ui/layout/WorkspaceLayout'
import { StatusBar } from './ui/layout/StatusBar'
import { ValidationSummary } from './ui/components/ValidationSummary'
import { ConfirmDialog } from './ui/components/ConfirmDialog'
import { AboutDialog } from './ui/components/AboutDialog'
import {
  getAdjacentOutpostId,
  handleHistoryShortcut,
  handleOutpostShortcut,
  handleSearchFocusShortcut,
} from './ui/keyboardShortcuts'

import {
  validateNetwork,
} from './domain/validation/validateNetwork'

import {
  collectionEditingSessionReducer,
  createCollectionEditingSession,
  getHistoryPresentationReset,
} from './domain/collectionEditingSession'

import type {
  HistoryLabelDescriptor,
  NetworkUpdate,
} from './domain/collectionEditingSession'
import { translateDescriptor } from './localization/catalog.ts'
import { getHistoryDisplayLabel } from './ui/historyPresentation.ts'

import type {
  CargoItem,
  ManufacturingEntry,
  OutpostNetwork,
  ResourceProductionRoute,
} from './domain/models'
import { getProductionRouteKey } from './domain/productionRoutes'
import {
  getInvariantCargoPadLabel,
  renumberCargoPadLabels,
} from './domain/cargoPadLabels.ts'
import {
  addExplicitResourcePresence,
  changeOutpostBody,
  changeOutpostSystem,
  removeExplicitResourcePresence,
  toggleOutpostBiomeGroup,
  toggleOutpostProductionRoute,
} from './domain/outpostEdits'
import {
  canActivateProductionRoute,
  canAddExplicitResourcePresence,
  hasExplicitResourcePresence,
} from './domain/resourcePresence.ts'
import { useLocalization } from './localization/LocalizationContext.ts'
import { getReferenceDisplayName } from './localization/referenceNames.ts'
import type { MessageDescriptor } from './localization/types.ts'
import {
  buildItemSearchCatalogue,
  getItemSearchMatches,
} from './ui/itemSearch.ts'
import { getItemSearchResults } from './domain/itemSearchResults.ts'
import {
  resolveSearchPalettePositionOnOpen,
  type PalettePosition,
} from './ui/itemSearchPosition.ts'

/**
 * Transient application feedback shown in the fixed status bar.
 *
 * Success messages expire automatically. Error messages remain visible until
 * they are replaced or explicitly dismissed.
 */
type StatusMessage =
  | {
      id: number
      kind: 'success'
      descriptor: MessageDescriptor
      diagnostic?: string
    }
  | {
      id: number
      kind: 'error'
      descriptor: MessageDescriptor
      reason?: MessageDescriptor
      diagnostic?: string
      deferAnnouncementUntilWindowFocus?: boolean
    }

function App({ referenceData }: { referenceData: ReferenceData }) {
  const { locale, t } = useLocalization()
  const [initialLoad] = useState(initializeNetworkCollection)
  const initialCollection = initialLoad.collection
  const [persistenceStatus, setPersistenceStatus] = useState<PersistenceStatus>(initialLoad.status)
  const lastPersistenceCollectionRef = useRef(initialCollection)

  const [session, dispatchEditingSession] =
    useReducer(
      collectionEditingSessionReducer,
      initialCollection,
      createCollectionEditingSession,
    )

  const collection = session.collection
  const activeSavedNetwork = getActiveSavedNetwork(collection)
  const network = activeSavedNetwork.network
  const history = session.history

  const planetaryHabitationRank =
    network.character.skills.planetaryHabitation

  const maxOutposts =
    planetaryHabitationRank === null
      ? null
      : getOutpostLimit(
          planetaryHabitationRank,
        )

  const outpostManagementRank =
    network.character.skills.outpostManagement

  const maxCargoPads =
    outpostManagementRank === null
      ? null
      : getCargoPadLimit(
          outpostManagementRank,
        )


  /**
   * Holds short-lived user feedback for completed application actions such as
   * importing or exporting JSON.
   *
   * This is presentation/session state only and is never persisted with the
   * outpost network.
   */
  const [statusMessage, setStatusMessage] =
    useState<StatusMessage | null>(null)
  const nextStatusMessageIdRef = useRef(0)

  const [isOutpostDragging, setIsOutpostDragging] =
    useState(false)

  const [isNavigationOpen, setIsNavigationOpen] =
    useState(true)

  const hideNavigationControlRef = useRef<HTMLButtonElement>(null)
  const showNavigationControlRef = useRef<HTMLButtonElement>(null)
  const navigationFocusTargetRef = useRef<'hide' | 'show' | null>(null)

  const [isDeleteNetworkDialogOpen, setIsDeleteNetworkDialogOpen] =
    useState(false)

  const [isAboutDialogOpen, setIsAboutDialogOpen] =
    useState(false)

  // Search is current-network presentation state and deliberately sits above
  // the outpost-keyed Matrix so ordinary navigation cannot remount it away.
  const [searchDraftQuery, setSearchDraftQuery] = useState('')
  const [highlightedSearchMatchKey, setHighlightedSearchMatchKey] =
    useState<string | null>(null)
  const [isSearchAutocompleteOpen, setIsSearchAutocompleteOpen] = useState(false)
  const [submittedSearchItem, setSubmittedSearchItem] = useState<CargoItem | null>(null)
  const [isSearchResultsOpen, setIsSearchResultsOpen] = useState(false)
  const [searchPalettePosition, setSearchPalettePosition] =
    useState<PalettePosition | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  /**
   * Clears successful action feedback automatically after a short display
   * period. Errors deliberately remain visible until replaced or dismissed.
   */
  useEffect(() => {
    if (
      !statusMessage ||
      statusMessage.kind !== 'success'
    ) {
      return
    }

    const timeoutId = window.setTimeout(
      () => {
        setStatusMessage(null)
      },
      5000,
    )

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [
    statusMessage,
  ])

  const resources = (referenceData?.resources ?? []).map((resource) => ({
    ...resource,
    name: getReferenceDisplayName('resource', resource.id, resource.name, locale),
  }))
  const products = (referenceData?.products ?? []).map((product) => ({
    ...product,
    name: getReferenceDisplayName('product', product.id, product.name, locale),
  }))

  /** History fallbacks must remain canonical English across locale changes. */
  function getCanonicalItemName(item: CargoItem): string {
    const reference = item.type === 'resource'
      ? referenceData?.resources.find(({ id }) => id === item.id)
      : referenceData?.products.find(({ id }) => id === item.id)
    return reference?.name ?? item.id
  }

  function getCanonicalResourceName(resourceId: string): string {
    return referenceData?.resources.find(({ id }) => id === resourceId)?.name ?? resourceId
  }
  const searchCatalogue = useMemo(
    () => referenceData ? buildItemSearchCatalogue(referenceData, locale) : [],
    [referenceData, locale],
  )
  const searchMatches = useMemo(
    () => getItemSearchMatches(searchCatalogue, searchDraftQuery, locale),
    [searchCatalogue, searchDraftQuery, locale],
  )
  const searchResults = useMemo(
    () => submittedSearchItem && referenceData
      ? getItemSearchResults(submittedSearchItem, network, referenceData)
      : [],
    [submittedSearchItem, network, referenceData],
  )
  const submittedSearchItemName = submittedSearchItem
    ? searchCatalogue.find((entry) => entry.key ===
      `${submittedSearchItem.type}:${submittedSearchItem.id}`)?.displayName ?? submittedSearchItem.id
    : null

  const effectiveHighlightedSearchMatchKey = highlightedSearchMatchKey &&
    searchMatches.some((match) => match.key === highlightedSearchMatchKey)
    ? highlightedSearchMatchKey
    : null

  useLayoutEffect(() => {
    const focusTarget = navigationFocusTargetRef.current
    if (!focusTarget) return

    navigationFocusTargetRef.current = null
    if (focusTarget === 'hide') hideNavigationControlRef.current?.focus()
    else showNavigationControlRef.current?.focus()
  }, [isNavigationOpen])

  /**
   * Navigation and Cargo use separate remount epochs because outpost-local
   * Cargo drafts must reset when context changes without disturbing Navigation.
   * Ordinary same-outpost value traversal leaves both epochs unchanged.
   */
  const [navigationPresentationEpoch, setNavigationPresentationEpoch] =
    useState(0)
  const [cargoPresentationEpoch, setCargoPresentationEpoch] =
    useState(0)

  const selectedOutpost =
    network.outposts.find((outpost) => outpost.id === session.context.outpostId) ??
    network.outposts[0]

  /**
   * Uses the requested selection while it remains valid, otherwise derives a
   * deterministic fallback without waiting for a repair render.
   */
  const effectiveSelectedOutpostId =
    selectedOutpost?.id ?? ''

  /**
   * Materials currently available at the selected outpost through active
   * production, manufacturing, or inbound cargo.
   *
   * This is derived from network state rather than stored separately.
   */
  const availableCargoItems =
    selectedOutpost
      ? getAvailableItemsAtOutpost(
          selectedOutpost.id,
          network,
          referenceData ?? undefined,
        )
      : []

  /**
   * Materials that already have a real source at the selected outpost.
   *
   * Planned Supply is intentionally excluded so the planning UI can offer only
   * items that still need a source.
   */
  const actuallyAvailableItems =
    selectedOutpost
      ? getActuallyAvailableItemsAtOutpost(
          selectedOutpost.id,
          network,
          referenceData ?? undefined,
        )
      : []

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

  const selectedBodyResources = referenceData?.bodyResources.find(
    (entry) => entry.bodyId === selectedOutpost?.bodyId,
  )

  const biomeGroups = referenceData
    ? getBiomeButtonGroups(referenceData, selectedOutpost?.bodyId ?? null)
    : []

  useEffect(() => {
    // Only a changed persisted collection (including active-network switches and
    // history traversal) authorizes replacing an unrecoverable original source.
    if (collection === lastPersistenceCollectionRef.current) return
    lastPersistenceCollectionRef.current = collection
    const next = trySaveNetworkCollection(collection)
    setPersistenceStatus((previous) => previous.kind === next.kind &&
      (previous.kind === 'saved' ||
        (next.kind !== 'saved' && previous.reason === next.reason))
      ? previous : next)
  }, [collection])

  function selectOutpost(outpostId: string | null) {
    dispatchEditingSession({ type: 'select-outpost', outpostId })
  }

  /**
   * Applies one user-visible network change and records it as one Undo step.
   *
   * The supplied update may change several related parts of the network.
   * History sees the complete operation as one semantic action.
   */
  function applyUndoableNetworkChange(
    label: HistoryLabelDescriptor,
    update: NetworkUpdate,
    outpostId?: string | null,
  ) {
    dispatchEditingSession({
      type: 'apply-active-network',
      label,
      timestamp: Date.now(),
      update,
      outpostId,
    })
  }

  function renderHistoryLabel(label: HistoryLabelDescriptor): string {
    return getHistoryDisplayLabel(label, locale)
  }

  function getStatusMessageText(message: StatusMessage): string {
    const descriptor = message.kind === 'error' && message.reason
      ? { ...message.descriptor, parameters: {
          ...message.descriptor.parameters,
          reason: translateDescriptor(locale, message.reason),
        } }
      : message.descriptor
    return translateDescriptor(locale, descriptor)
  }

  function renderStatusMessage(message: StatusMessage) {
    const text = getStatusMessageText(message)
    return message.diagnostic ? <span title={message.diagnostic}>{text}</span> : text
  }

  /**
   * Commits one completed character-name edit as a single Undo step.
   *
   * CharacterHeader keeps individual keystrokes in local UI state and calls this
   * function only when editing is complete.
   */
  function commitCharacterName(
    name: string,
  ) {
    if (
      network.character.name === name
    ) {
      return
    }

    const previousName =
      network.character.name

    applyUndoableNetworkChange(
      { key: 'history.renameCharacter', parameters: { previousName, name } },
      (currentNetwork) => ({
        ...currentNetwork,

        character: {
          ...currentNetwork.character,
          name,
        },
      }),
    )
  }

  function commitCharacterLevel(level: number | null) {
    const currentLevel = network.character.level
    if (currentLevel === level) return
    const label: HistoryLabelDescriptor = level === null
      ? { key: 'history.clearCharacterLevel' }
      : currentLevel === null
        ? { key: 'history.setCharacterLevel', parameters: { level } }
        : { key: 'history.changeCharacterLevel', parameters: { previousLevel: currentLevel, level } }
    applyUndoableNetworkChange(label, (currentNetwork) => ({
      ...currentNetwork,
      character: { ...currentNetwork.character, level },
    }))
  }

  /**
   * Commits one completed character skill-rank edit as a single Undo step.
   *
   * null means that no rank is currently recorded for that skill.
   */
  function commitCharacterSkill(
    skill: keyof typeof network.character.skills,
    rank: number | null,
  ) {
    const currentRank =
      network.character.skills[skill]

    if (currentRank === rank) {
      return
    }

    const label: HistoryLabelDescriptor =
      rank === null
        ? { key: 'history.clearSkill', skillId: skill }
        : currentRank === null
          ? { key: 'history.setSkill', skillId: skill, parameters: { rank } }
          : { key: 'history.changeSkill', skillId: skill,
              parameters: { previousRank: currentRank, rank } }

    applyUndoableNetworkChange(
      label,
      (currentNetwork) => ({
        ...currentNetwork,

        character: {
          ...currentNetwork.character,

          skills: {
            ...currentNetwork.character.skills,
            [skill]: rank,
          },
        },
      }),
    )
  }

  /**
   * Moves one outpost directly to a final persisted array position.
   *
   * Drag-and-drop and the single-step arrow controls share this path so every
   * completed reorder retains the same immutable, one-history-entry semantics.
   * Invalid IDs, positions outside the array, and no-op moves are ignored.
   */
  function moveOutpostToIndex(
    outpostId: string,
    finalIndex: number,
  ) {
    const currentIndex =
      network.outposts.findIndex(
        (outpost) =>
          outpost.id === outpostId,
      )

    if (currentIndex === -1) {
      return
    }

    if (
      finalIndex < 0 ||
      finalIndex >= network.outposts.length ||
      finalIndex === currentIndex
    ) {
      return
    }

    const movedOutpost =
      network.outposts[currentIndex]

    applyUndoableNetworkChange(
      { key: 'history.moveOutpost', parameters: { outpost: movedOutpost.name, position: finalIndex + 1 } },
      (currentNetwork) => {
        const liveCurrentIndex =
          currentNetwork.outposts.findIndex(
            (outpost) => outpost.id === outpostId,
          )

        if (
          liveCurrentIndex === -1 ||
          finalIndex < 0 ||
          finalIndex >= currentNetwork.outposts.length ||
          finalIndex === liveCurrentIndex
        ) {
          return currentNetwork
        }

        const reorderedOutposts =
          [...currentNetwork.outposts]

        const [outpost] =
          reorderedOutposts.splice(
            liveCurrentIndex,
            1,
          )

        reorderedOutposts.splice(
          finalIndex,
          0,
          outpost,
        )

        return {
          ...currentNetwork,
          outposts: reorderedOutposts,
        }
      },
    )
  }

  /**
   * Moves one outpost upward by one position.
   */
  function moveOutpostUp(
    outpostId: string,
  ) {
    const currentIndex = network.outposts.findIndex(
      (outpost) => outpost.id === outpostId,
    )
    moveOutpostToIndex(outpostId, currentIndex - 1)
  }

  /**
   * Moves one outpost downward by one position.
   */
  function moveOutpostDown(
    outpostId: string,
  ) {
    const currentIndex = network.outposts.findIndex(
      (outpost) => outpost.id === outpostId,
    )
    moveOutpostToIndex(outpostId, currentIndex + 1)
  }  

  /**
   * Adds a new outpost and records the creation as one Undo step.
   *
   * Selection moves to the new outpost as presentation state, while the
   * persisted network addition is handled through the editing-session history.
   */
  function addOutpost() {
    const newOutpost =
      createDefaultOutpost(
        network.outposts,
        crypto.randomUUID(),
        t('outpost.defaultName'),
      )

    applyUndoableNetworkChange(
      { key: 'history.addOutpost' },
      (currentNetwork) => ({
        ...currentNetwork,

        outposts: [
          ...currentNetwork.outposts,
          newOutpost,
        ],
      }),
      newOutpost.id,
    )
  }

  useEffect(() => {
    function handleGlobalAppShortcut(event: KeyboardEvent) {
      const isModalOpen = isDeleteNetworkDialogOpen || isAboutDialogOpen
      const handledHistoryShortcut = handleHistoryShortcut(event, {
        isModalOpen,
        canUndo: history.past.length > 0,
        canRedo: history.future.length > 0,
        onUndo: undo,
        onRedo: redo,
      })
      if (handledHistoryShortcut) return

      const handledSearchFocus = handleSearchFocusShortcut(event, {
        isModalOpen,
        focusSearch: () => {
          const input = searchInputRef.current
          if (!input) return false
          input.focus()
          if (input.value) input.select()
          return true
        },
      })
      if (handledSearchFocus) return

      if (!event.defaultPrevented && !isModalOpen && event.key === 'Escape') {
        if (isSearchAutocompleteOpen) {
          setIsSearchAutocompleteOpen(false)
          setHighlightedSearchMatchKey(null)
          event.preventDefault()
          return
        }
        if (isSearchResultsOpen) {
          setIsSearchResultsOpen(false)
          event.preventDefault()
          return
        }
      }

      handleOutpostShortcut(event, (shortcut) => {
        if (shortcut === 'add') {
          addOutpost()
          return true
        }

        const adjacentOutpostId = getAdjacentOutpostId(
          network.outposts.map((outpost) => outpost.id),
          effectiveSelectedOutpostId,
          shortcut,
        )
        if (!adjacentOutpostId) return false

        selectOutpost(adjacentOutpostId)
        return true
      })
    }

    document.addEventListener('keydown', handleGlobalAppShortcut)
    return () => {
      document.removeEventListener('keydown', handleGlobalAppShortcut)
    }
  })

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
    const nextSelectedOutpostId = effectiveSelectedOutpostId === outpostId
      ? remainingOutposts[Math.min(deletedIndex, remainingOutposts.length - 1)].id
      : effectiveSelectedOutpostId

    applyUndoableNetworkChange(
      { key: 'history.deleteOutpost', parameters: { outpost: deletedOutpost.name } },
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
      nextSelectedOutpostId,
    )
  }

  /**
   * Moves one cargo pad directly to a final persisted array position.
   *
   * Drag-and-drop and the single-step arrow controls share this path so every
   * completed reorder preserves pad identity and creates one history entry.
   * Invalid IDs, positions outside the array, and no-op moves are ignored.
   */
  function moveCargoPadToIndex(
    outpostId: string,
    cargoPadId: string,
    finalIndex: number,
  ) {
    const outpost =
      network.outposts.find(
        (candidate) =>
          candidate.id === outpostId,
      )

    if (!outpost) {
      return
    }

    const currentIndex =
      outpost.cargoPads.findIndex(
        (cargoPad) =>
          cargoPad.id === cargoPadId,
      )

    if (currentIndex === -1) {
      return
    }

    if (
      finalIndex < 0 ||
      finalIndex >= outpost.cargoPads.length ||
      finalIndex === currentIndex
    ) {
      return
    }

    applyUndoableNetworkChange(
      { key: 'history.moveCargoPad', parameters: {
        outpost: outpost.name, position: finalIndex + 1,
      }, cargoPadOrdinalParameters: [{ parameter: 'pad', ordinal: currentIndex + 1 }] },
      (currentNetwork) => {
        const liveOutpost = currentNetwork.outposts.find(
          (candidate) => candidate.id === outpostId,
        )
        const liveCurrentIndex =
          liveOutpost?.cargoPads.findIndex(
            (cargoPad) => cargoPad.id === cargoPadId,
          ) ?? -1

        if (
          !liveOutpost ||
          liveCurrentIndex === -1 ||
          finalIndex < 0 ||
          finalIndex >= liveOutpost.cargoPads.length ||
          finalIndex === liveCurrentIndex
        ) {
          return currentNetwork
        }

        return {
          ...currentNetwork,
          outposts: currentNetwork.outposts.map(
            (candidateOutpost) => {
              if (candidateOutpost.id !== outpostId) {
                return candidateOutpost
              }

              const reorderedCargoPads =
                [...candidateOutpost.cargoPads]
              const [cargoPad] = reorderedCargoPads.splice(
                liveCurrentIndex,
                1,
              )

              reorderedCargoPads.splice(
                finalIndex,
                0,
                cargoPad,
              )

              /*
               * Labels describe current position rather than identity. Reassign
               * them while retaining each pad ID and its associated data.
               */
              const renumberedCargoPads =
                renumberCargoPadLabels(reorderedCargoPads)

              return {
                ...candidateOutpost,
                cargoPads: renumberedCargoPads,
              }
            },
          ),
        }
      },
    )
  }

  /**
   * Moves one cargo pad upward by one position.
   */
  function moveCargoPadUp(
    outpostId: string,
    cargoPadId: string,
  ) {
    const outpost = network.outposts.find(
      (candidate) => candidate.id === outpostId,
    )
    const currentIndex = outpost?.cargoPads.findIndex(
      (cargoPad) => cargoPad.id === cargoPadId,
    ) ?? -1

    moveCargoPadToIndex(outpostId, cargoPadId, currentIndex - 1)
  }

  /**
   * Moves one cargo pad downward by one position.
   */
  function moveCargoPadDown(
    outpostId: string,
    cargoPadId: string,
  ) {
    const outpost = network.outposts.find(
      (candidate) => candidate.id === outpostId,
    )
    const currentIndex = outpost?.cargoPads.findIndex(
      (cargoPad) => cargoPad.id === cargoPadId,
    ) ?? -1

    moveCargoPadToIndex(outpostId, cargoPadId, currentIndex + 1)
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
      label: getInvariantCargoPadLabel(outpost.cargoPads.length),
      type: 'regular' as const,
      outboundItems: [],
    }

    applyUndoableNetworkChange(
      { key: 'history.addCargoPad', parameters: { outpost: outpost.name },
        cargoPadOrdinalParameters: [{
          parameter: 'pad', ordinal: outpost.cargoPads.length + 1,
        }] },
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
      { key: 'history.deleteCargoPad', parameters: { outpost: outpost.name },
        cargoPadOrdinalParameters: [{
          parameter: 'pad', ordinal: outpost.cargoPads.findIndex(({ id }) => id === cargoPadId) + 1,
        }] },
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
                  renumberCargoPadLabels(
                    candidateOutpost.cargoPads.filter(
                      (pad) => pad.id !== cargoPadId,
                    ),
                  )

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
        }, referenceData ?? undefined),
    )
  }

  /**
   * Removes the cargo link involving one pad and records the unlink as one
   * Undo step.
   *
   * Unlinking may remove inbound availability, but it must not recreate Planned
   * Supply automatically. Undo can still restore any earlier planning state
   * because history retains the complete pre-action network snapshot.
   */
  function unlinkCargoPad(
    outpostId: string,
    cargoPadId: string,
  ) {
    const outpost =
      network.outposts.find(
        (candidate) =>
          candidate.id === outpostId,
      )

    const cargoPad =
      outpost?.cargoPads.find(
        (candidate) =>
          candidate.id === cargoPadId,
      )

    if (!outpost || !cargoPad) {
      return
    }

    const existingLink =
      network.cargoLinks.find(
        (link) =>
          (
            link.endpointA.outpostId === outpostId &&
            link.endpointA.cargoPadId === cargoPadId
          ) ||
          (
            link.endpointB.outpostId === outpostId &&
            link.endpointB.cargoPadId === cargoPadId
          ),
      )

    if (!existingLink) {
      return
    }

    applyUndoableNetworkChange(
      { key: 'history.unlinkCargoPad', parameters: { outpost: outpost.name },
        cargoPadOrdinalParameters: [{
          parameter: 'pad', ordinal: outpost.cargoPads.findIndex(({ id }) => id === cargoPadId) + 1,
        }] },
      (currentNetwork) => ({
        ...currentNetwork,

        cargoLinks:
          currentNetwork.cargoLinks.filter(
            (link) =>
              link.id !== existingLink.id,
          ),
      }),
    )
  }

  /**
   * Creates or replaces one cargo-link relationship and records every related
   * link mutation as one Undo step.
   *
   * Either endpoint may already participate in another link. Those competing
   * relationships are removed before the new bidirectional link is created.
   * Newly available inbound cargo may also retire Planned Supply entries.
   */
  function setCargoLink(
    localOutpostId: string,
    localCargoPadId: string,
    remoteOutpostId: string,
    remoteCargoPadId: string,
  ) {
    const localOutpost =
      network.outposts.find(
        (candidate) =>
          candidate.id === localOutpostId,
      )

    const remoteOutpost =
      network.outposts.find(
        (candidate) =>
          candidate.id === remoteOutpostId,
      )

    const localCargoPad =
      localOutpost?.cargoPads.find(
        (candidate) =>
          candidate.id === localCargoPadId,
      )

    const remoteCargoPad =
      remoteOutpost?.cargoPads.find(
        (candidate) =>
          candidate.id === remoteCargoPadId,
      )

    if (
      !localOutpost ||
      !remoteOutpost ||
      !localCargoPad ||
      !remoteCargoPad
    ) {
      return
    }

    const existingLocalLink =
      network.cargoLinks.find(
        (link) =>
          (
            link.endpointA.outpostId === localOutpostId &&
            link.endpointA.cargoPadId === localCargoPadId
          ) ||
          (
            link.endpointB.outpostId === localOutpostId &&
            link.endpointB.cargoPadId === localCargoPadId
          ),
      )

    const alreadyLinkedTogether =
      existingLocalLink &&
      (
        (
          existingLocalLink.endpointA.outpostId === localOutpostId &&
          existingLocalLink.endpointA.cargoPadId === localCargoPadId &&
          existingLocalLink.endpointB.outpostId === remoteOutpostId &&
          existingLocalLink.endpointB.cargoPadId === remoteCargoPadId
        ) ||
        (
          existingLocalLink.endpointB.outpostId === localOutpostId &&
          existingLocalLink.endpointB.cargoPadId === localCargoPadId &&
          existingLocalLink.endpointA.outpostId === remoteOutpostId &&
          existingLocalLink.endpointA.cargoPadId === remoteCargoPadId
        )
      )

    if (alreadyLinkedTogether) {
      return
    }

    const label: HistoryLabelDescriptor =
      existingLocalLink
        ? { key: 'history.changeCargoLink', parameters: {
            localOutpost: localOutpost.name, remoteOutpost: remoteOutpost.name,
          }, cargoPadOrdinalParameters: [
            { parameter: 'localPad', ordinal: localOutpost.cargoPads.findIndex(({ id }) => id === localCargoPadId) + 1 },
            { parameter: 'remotePad', ordinal: remoteOutpost.cargoPads.findIndex(({ id }) => id === remoteCargoPadId) + 1 },
          ] }
        : { key: 'history.linkCargoPad', parameters: {
            localOutpost: localOutpost.name, remoteOutpost: remoteOutpost.name,
          }, cargoPadOrdinalParameters: [
            { parameter: 'localPad', ordinal: localOutpost.cargoPads.findIndex(({ id }) => id === localCargoPadId) + 1 },
            { parameter: 'remotePad', ordinal: remoteOutpost.cargoPads.findIndex(({ id }) => id === remoteCargoPadId) + 1 },
          ] }

    const newLink = {
      id: crypto.randomUUID(),

      endpointA: {
        outpostId: localOutpostId,
        cargoPadId: localCargoPadId,
      },

      endpointB: {
        outpostId: remoteOutpostId,
        cargoPadId: remoteCargoPadId,
      },
    }

    applyUndoableNetworkChange(
      label,
      (currentNetwork) => {
        const remainingLinks =
          currentNetwork.cargoLinks.filter(
            (link) =>
              !(
                (
                  link.endpointA.outpostId === localOutpostId &&
                  link.endpointA.cargoPadId === localCargoPadId
                ) ||
                (
                  link.endpointB.outpostId === localOutpostId &&
                  link.endpointB.cargoPadId === localCargoPadId
                ) ||
                (
                  link.endpointA.outpostId === remoteOutpostId &&
                  link.endpointA.cargoPadId === remoteCargoPadId
                ) ||
                (
                  link.endpointB.outpostId === remoteOutpostId &&
                  link.endpointB.cargoPadId === remoteCargoPadId
                )
              ),
          )

        return retireFulfilledPlannedSupply({
          ...currentNetwork,

          cargoLinks: [
            ...remainingLinks,
            newLink,
          ],
        }, referenceData ?? undefined)
      },
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

    const itemName = getCanonicalItemName(item)

    applyUndoableNetworkChange(
      { key: isCurrentlyExported ? 'history.removeExport' : 'history.addExport', parameters: {
        outpost: outpost.name,
      }, referenceParameters: [{
        parameter: 'item', kind: item.type, id: item.id, fallback: itemName,
      }], cargoPadOrdinalParameters: [{
        parameter: 'pad', ordinal: outpost.cargoPads.findIndex(({ id }) => id === cargoPadId) + 1,
      }] },
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
        }, referenceData ?? undefined),
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
      { key: 'history.changeCargoPadType', parameters: {
        outpost: outpost.name, type: nextType,
      }, cargoPadOrdinalParameters: [{
        parameter: 'pad', ordinal: outpost.cargoPads.findIndex(({ id }) => id === cargoPadId) + 1,
      }] },
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
    const presentationReset = getHistoryPresentationReset(session, 'undo')
    dispatchEditingSession({
      type: 'undo',
    })
    resetNetworkPresentationState(presentationReset)
  }

  /**
   * Moves the editing session forward by one previously undone user action.
   */
  function redo() {
    const presentationReset = getHistoryPresentationReset(session, 'redo')
    dispatchEditingSession({
      type: 'redo',
    })
    resetNetworkPresentationState(presentationReset)
  }

  function resetNetworkPresentationState(
    reset: { navigation: boolean; cargo: boolean; search: boolean } = {
      navigation: true,
      cargo: true,
      search: true,
    },
  ) {
    if (reset.navigation) {
      setIsOutpostDragging(false)
      setNavigationPresentationEpoch((currentEpoch) => currentEpoch + 1)
    }
    if (reset.cargo) {
      setCargoPresentationEpoch((currentEpoch) => currentEpoch + 1)
    }
    if (reset.search) {
      setSearchDraftQuery('')
      setHighlightedSearchMatchKey(null)
      setIsSearchAutocompleteOpen(false)
      setSubmittedSearchItem(null)
      setIsSearchResultsOpen(false)
      setSearchPalettePosition(null)
    }
  }

  function submitItemSearch(item: CargoItem) {
    setSubmittedSearchItem({ ...item })
    setIsSearchResultsOpen(true)
    setSearchPalettePosition((current) => resolveSearchPalettePositionOnOpen(
      current,
      searchInputRef.current?.getBoundingClientRect() ?? { left: 12, bottom: 60 },
      { width: 420, height: 260 },
      { width: window.innerWidth, height: window.innerHeight },
    ))
  }

  function switchNetwork(networkId: string) {
    dispatchEditingSession({ type: 'switch-network', networkId })
    resetNetworkPresentationState()
  }

  function addNetwork() {
    dispatchEditingSession({
      type: 'add-network',
      networkId: crypto.randomUUID(),
      outpostId: crypto.randomUUID(),
      outpostBaseName: t('outpost.defaultName'),
      timestamp: Date.now(),
    })
    resetNetworkPresentationState()
  }

  /** Deletes the active slot or resets the sole slot after dialog consent. */
  function deleteOrResetNetwork() {
    if (collection.networks.length === 1) {
      dispatchEditingSession({
        type: 'reset-network',
        outpostId: crypto.randomUUID(),
        outpostBaseName: t('outpost.defaultName'),
        timestamp: Date.now(),
      })
    } else {
      dispatchEditingSession({ type: 'delete-network', timestamp: Date.now() })
    }
    resetNetworkPresentationState()
    setIsDeleteNetworkDialogOpen(false)
  }

  /**
   * Commits one completed outpost-name edit as a single Undo step.
   *
   * The text field keeps keystrokes in local UI state and calls this function
   * only when editing is complete, so one rename does not generate one history
   * entry per character.
   */
  function commitSelectedOutpostName(
    name: string,
  ) {
    if (
      selectedOutpost.name === name
    ) {
      return
    }

    const previousName =
      selectedOutpost.name

    applyUndoableNetworkChange(
      { key: 'history.renameOutpost', parameters: { previousName, name } },
      (currentNetwork) => ({
        ...currentNetwork,

        outposts:
          currentNetwork.outposts.map(
            (outpost) =>
              outpost.id === effectiveSelectedOutpostId
                ? {
                    ...outpost,
                    name,
                  }
                : outpost,
          ),
      }),
    )
  }

  /**
   * Changes the selected outpost's star system and clears its selected body as
   * one undoable action.
   *
   * Planetary bodies belong to one specific star system, so an existing body
   * selection cannot survive a system change.
   */
  function updateSelectedOutpostSystem(
    systemId: string,
  ) {
    if (
      selectedOutpost.systemId === systemId
    ) {
      return
    }

    const system =
      referenceData?.systems.find(
        (candidate) =>
          candidate.id === systemId,
      )

    const label: HistoryLabelDescriptor =
      systemId
        ? { key: 'history.changeSystem', parameters: {
            outpost: selectedOutpost.name,
          }, referenceParameters: [{
            parameter: 'system', kind: 'system', id: systemId,
            fallback: system?.name ?? systemId,
          }] }
        : { key: 'history.clearSystem', parameters: { outpost: selectedOutpost.name } }

    applyUndoableNetworkChange(
      label,
      (currentNetwork) => ({
        ...currentNetwork,

        outposts:
          currentNetwork.outposts.map(
            (outpost) =>
              outpost.id === effectiveSelectedOutpostId
                ? changeOutpostSystem(outpost, systemId)
                : outpost,
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

    const label: HistoryLabelDescriptor =
      bodyId
        ? { key: 'history.changeBody', parameters: {
            outpost: selectedOutpost.name,
          }, referenceParameters: [{
            parameter: 'body', kind: 'body', id: bodyId,
            fallback: body?.name ?? bodyId,
          }] }
        : { key: 'history.clearBody', parameters: { outpost: selectedOutpost.name } }

    applyUndoableNetworkChange(
      label,
      (currentNetwork) => ({
        ...currentNetwork,

        outposts:
          currentNetwork.outposts.map(
            (outpost) =>
              outpost.id === effectiveSelectedOutpostId
                ? changeOutpostBody(outpost, bodyId)
                : outpost,
          ),
      }),
    )
  }

  /** Toggles every ID represented by one biome button as one history action. */
  function toggleSelectedOutpostBiomeGroup(
    bodyBiomeIds: BodyBiomeId[],
  ) {
    const isSelected = selectedOutpost.selectedBiomeIds.length > 0 &&
      bodyBiomeIds.every((id) => selectedOutpost.selectedBiomeIds.includes(id))
    applyUndoableNetworkChange(
      { key: isSelected ? 'history.removeBiome' : 'history.addBiome',
        parameters: { outpost: selectedOutpost.name } },
      (currentNetwork) => ({
        ...currentNetwork,
        outposts: currentNetwork.outposts.map((outpost) => {
          if (outpost.id !== effectiveSelectedOutpostId) return outpost
          return toggleOutpostBiomeGroup(outpost, bodyBiomeIds)
        }),
      }),
    )
  }

  /**
   * Adds or removes one local resource and records the complete change as one
   * Undo step.
   *
   * Removing a local resource also removes it from active production because
   * an outpost cannot continue producing a resource that is no longer recorded
   * as present at the site.
   */
  function toggleLocalResource(
    resourceId: string,
  ) {
    const isCurrentlyLocal =
      selectedOutpost.localResources.includes(
        resourceId,
      )

    const resourceName = getCanonicalResourceName(resourceId)

    applyUndoableNetworkChange(
      { key: isCurrentlyLocal ? 'history.removeLocalResource' : 'history.addLocalResource',
        parameters: { outpost: selectedOutpost.name },
        referenceParameters: [{
          parameter: 'resource', kind: 'resource', id: resourceId, fallback: resourceName,
        }] },
      (currentNetwork) => ({
        ...currentNetwork,

        outposts:
          currentNetwork.outposts.map(
            (outpost) => {
              if (
                outpost.id !== effectiveSelectedOutpostId
              ) {
                return outpost
              }

              if (isCurrentlyLocal) {
                return {
                  ...outpost,

                  localResources:
                    outpost.localResources.filter(
                      (id) =>
                        id !== resourceId,
                    ),

                  activeProduction: outpost.activeProduction.filter(
                    (route) => route.resourceId !== resourceId,
                  ),
                }
              }

              return {
                ...outpost,

                localResources: [
                  ...outpost.localResources,
                  resourceId,
                ],
              }
            },
          ),
      }),
    )
  }

  /** Adds/removes explicit presence and dependent production as one history action. */
  function toggleExplicitResourcePresence(resourceId: string) {
    const isPresent = hasExplicitResourcePresence(selectedOutpost, resourceId)
    if (!isPresent && !canAddExplicitResourcePresence(network.character, resourceId)) return
    const resourceName = getCanonicalResourceName(resourceId)
    applyUndoableNetworkChange(
      { key: isPresent ? 'history.removeExplicitResource' : 'history.addExplicitResource',
        parameters: { outpost: selectedOutpost.name },
        referenceParameters: [{
          parameter: 'resource', kind: 'resource', id: resourceId, fallback: resourceName,
        }] },
      (currentNetwork) => ({
        ...currentNetwork,
        outposts: currentNetwork.outposts.map((outpost) =>
          outpost.id !== effectiveSelectedOutpostId
            ? outpost
            : isPresent
              ? removeExplicitResourcePresence(outpost, resourceId)
              : addExplicitResourcePresence(outpost, resourceId)),
      }),
    )
  }

  /**
   * Activates or deactivates production for one local resource and records the
   * complete change as one Undo step.
   *
   * Enabling production may also retire a matching Planned Supply placeholder.
   * Because the whole resulting network is recorded as one action, Undo restores
   * both the production state and any automatically retired planning entry.
   */
  function toggleActiveProduction(
    route: ResourceProductionRoute,
  ) {
    const isCurrentlyActive =
      selectedOutpost.activeProduction.some(
        (candidate) => getProductionRouteKey(candidate) === getProductionRouteKey(route),
      )

    const resourceName = getCanonicalResourceName(route.resourceId)

    if (!isCurrentlyActive && (!referenceData || !canActivateProductionRoute(
      network.character, selectedOutpost, route, referenceData,
    ))) return

    applyUndoableNetworkChange(
      { key: isCurrentlyActive ? 'history.stopProducing' : 'history.startProducing',
        parameters: { outpost: selectedOutpost.name },
        referenceParameters: [{
          parameter: 'resource', kind: 'resource', id: route.resourceId, fallback: resourceName,
        }] },
      (currentNetwork) => {
        const updatedNetwork: OutpostNetwork = {
          ...currentNetwork,

          outposts:
            currentNetwork.outposts.map(
              (outpost) =>
                outpost.id === effectiveSelectedOutpostId
                  ? toggleOutpostProductionRoute(outpost, route)
                  : outpost,
            ),
        }

        return isCurrentlyActive
          ? updatedNetwork
          : retireFulfilledPlannedSupply(
              updatedNetwork,
              referenceData ?? undefined,
            )
      },
    )
  }

  /** Commits a complete manufacturing draft as at most one Undo step. */
  function commitManufacturing(
    entries: ManufacturingEntry[],
  ) {
    const currentEntries = selectedOutpost.manufacturing
    const isUnchanged =
      currentEntries.length === entries.length &&
      currentEntries.every((entry) =>
        entries.some(
          (candidate) =>
            candidate.productId === entry.productId &&
            candidate.quantity === entry.quantity,
        ),
      )

    if (isUnchanged) {
      return
    }

    applyUndoableNetworkChange(
      { key: 'history.editManufacturing', parameters: { outpost: selectedOutpost.name } },
      (currentNetwork) =>
        retireFulfilledPlannedSupply({
          ...currentNetwork,
          outposts: currentNetwork.outposts.map((outpost) =>
            outpost.id === effectiveSelectedOutpostId
              ? {
                  ...outpost,
                  manufacturing: entries.map((entry) => ({ ...entry })),
                }
              : outpost,
          ),
        }, referenceData ?? undefined),
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

    const itemName = getCanonicalItemName(item)

    applyUndoableNetworkChange(
      { key: isCurrentlyPlanned ? 'history.removePlannedSupply' : 'history.addPlannedSupply',
        referenceParameters: [{
          parameter: 'item', kind: item.type, id: item.id, fallback: itemName,
        }] },
      (currentNetwork) => retireFulfilledPlannedSupply({
        ...currentNetwork,

        outposts:
          currentNetwork.outposts.map(
            (outpost) => {
              if (
                outpost.id !== effectiveSelectedOutpostId
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
      }, referenceData ?? undefined),
    )
  }

  /**
   * Reports a completed JSON export in the application's transient status area.
   *
   * The browser download is intentionally treated as an export operation rather
   * than a continuing connection to the generated file.
   */
  function reportNetworkExport(
    fileName: string,
  ) {
    setStatusMessage({
      id: ++nextStatusMessageIdRef.current,
      kind: 'success',
      descriptor: { key: 'status.export.success', parameters: { fileName } },
    })
  }

  /**
   * Replaces the current network with one successfully imported from JSON and
   * reports the completed import in the transient status area.
   *
   * Import validation/deserialization happens before this function is called, so
   * failed imports never modify network state or history.
   */
  function importNetwork(
    importedCollection: NetworkCollection,
    fileName: string,
  ) {
    dispatchEditingSession({
      type: 'replace-collection',
      collection: importedCollection,
      timestamp: Date.now(),
    })
    resetNetworkPresentationState()

    setStatusMessage({
      id: ++nextStatusMessageIdRef.current,
      kind: 'success',
      descriptor: { key: 'status.import.success', parameters: { fileName } },
    })
  }

  /**
   * Reports a failed JSON import without modifying network state or history.
   */
  function reportNetworkImportError(
    fileName: string,
    reason: MessageDescriptor,
    diagnostic?: string,
  ) {
    setStatusMessage({
      id: ++nextStatusMessageIdRef.current,
      kind: 'error',
      descriptor: { key: 'status.import.failed', parameters: { fileName, reason: '' } },
      reason,
      diagnostic,
      deferAnnouncementUntilWindowFocus: true,
    })
  }  

  return (
    <main>
      <TitleBar onAbout={() => setIsAboutDialogOpen(true)} />

      {/*
      * Network-level working controls remain visible while the user scrolls
      * through the outpost workspace.
      */}
      <PageHeader
        main={
          <CharacterHeader
            character={network.character}
            onNameCommit={commitCharacterName}
            onLevelCommit={commitCharacterLevel}
            onSkillCommit={commitCharacterSkill}
          />
        }
        actions={
          <>
            <button
              type="button"
              onClick={() => {
                if (selectedOutpost) {
                  deleteOutpost(selectedOutpost.id)
                }
              }}
              disabled={network.outposts.length <= 1}
            >
              {t('outpost.delete')}
            </button>

            <button
              type="button"
              onClick={undo}
              disabled={history.past.length === 0}
              title={
                history.past.length > 0
                  ? t('history.undo.action', {
                      action: renderHistoryLabel(history.past.at(-1)!.label),
                    })
                  : t('history.undo.none')
              }
            >
              {t('history.undo')}
            </button>

            <button
              type="button"
              onClick={redo}
              disabled={history.future.length === 0}
              title={
                history.future.length > 0
                  ? t('history.redo.action', {
                      action: renderHistoryLabel(history.future.at(-1)!.label),
                    })
                  : t('history.redo.none')
              }
            >
              {t('history.redo')}
            </button>

            <NetworkExportButton
              collection={collection}
              onExport={reportNetworkExport}
            />
            <NetworkImportButton
              onImport={importNetwork}
              onImportError={reportNetworkImportError}
            />
          </>
        }
        networkActions={
          <>
            <span className="page-header__network-label">{t('network.label')}</span>
            <div className="page-header__network-controls">
              <button
                type="button"
                className="page-header__network-button"
                aria-label={t('network.previous')}
                title={t('network.previous')}
                disabled={collection.networks.length === 1}
                onClick={() => switchNetwork(getPreviousNetworkId(collection))}
              >
                &lt;
              </button>
              <span className="page-header__network-ordinal" aria-label={t('network.active')}>
                {collection.networks.findIndex(({ id }) => id === collection.activeNetworkId) + 1}
                {' / '}{collection.networks.length}
              </span>
              <button
                type="button"
                className="page-header__network-button"
                aria-label={t('network.next')}
                title={t('network.next')}
                disabled={collection.networks.length === 1}
                onClick={() => switchNetwork(getNextNetworkId(collection))}
              >
                &gt;
              </button>
              <button
                type="button"
                className="page-header__network-button"
                aria-label={t('network.add')}
                title={t('network.add')}
                onClick={addNetwork}
              >
                +
              </button>
              <button
                type="button"
                className="page-header__network-button"
                aria-label={collection.networks.length === 1
                  ? t('network.reset.button')
                  : t('network.delete.button')}
                title={collection.networks.length === 1
                  ? t('network.reset.button')
                  : t('network.delete.button')}
                onClick={() => setIsDeleteNetworkDialogOpen(true)}
              >
                -
              </button>
            </div>
          </>
        }
      />

      {/*
      * The main outpost workspace is divided into three independent regions:
      * navigation on the left, outpost editing in the middle, and cargo on
      * the right.
      *
      * WorkspaceLayout owns only the positioning. The feature components
      * themselves remain unaware of which column they occupy.
      */}
      <WorkspaceLayout
        isNavigationOpen={isNavigationOpen}
        onShowNavigation={() => {
          navigationFocusTargetRef.current = 'hide'
          setIsNavigationOpen(true)
        }}
        showNavigationControlRef={showNavigationControlRef}
        left={
          <OutpostList
            key={`${activeSavedNetwork.id}:${navigationPresentationEpoch}`}
            outposts={network.outposts}
            maxOutposts={maxOutposts}
            selectedOutpostId={effectiveSelectedOutpostId}
            onSelectOutpost={selectOutpost}
            onMoveOutpost={moveOutpostToIndex}
            onMoveOutpostUp={moveOutpostUp}
            onMoveOutpostDown={moveOutpostDown}
            onAddOutpost={addOutpost}
            onDragActiveChange={setIsOutpostDragging}
            onHideNavigation={() => {
              navigationFocusTargetRef.current = 'show'
              setIsNavigationOpen(false)
            }}
            hideNavigationControlRef={hideNavigationControlRef}
          />
        }

        top={
          selectedOutpost ? <OutpostDetails
            outpost={selectedOutpost}
            systems={referenceData?.systems ?? []}
            bodies={referenceData?.bodies ?? []}
            biomeGroups={biomeGroups}
            onNameCommit={commitSelectedOutpostName}
            onSystemChange={updateSelectedOutpostSystem}
            onBodyChange={updateSelectedOutpostBody}
            onBiomeGroupToggle={toggleSelectedOutpostBiomeGroup}
          /> : null
        }

        middle={
          <>
            {selectedOutpost?.bodyId && !selectedBodyResources && (
              <p className="reference-data-empty">
                {t('outpost.referenceData.empty')}
              </p>
            )}

            {referenceData && selectedOutpost && <OutpostStatusMatrix
              key={selectedOutpost.id}
              outpost={selectedOutpost}
              network={network}
              resources={resources}
              referenceData={referenceData}
              products={products}
              availableItems={availableCargoItems}
              actuallyAvailableItems={actuallyAvailableItems}
              headingControl={<SearchForItems
                inputRef={searchInputRef}
                draftQuery={searchDraftQuery}
                matches={searchMatches}
                highlightedMatchKey={effectiveHighlightedSearchMatchKey}
                isAutocompleteOpen={isSearchAutocompleteOpen}
                submittedItemName={submittedSearchItemName}
                results={searchResults}
                isResultsOpen={isSearchResultsOpen}
                palettePosition={searchPalettePosition}
                onDraftQueryChange={setSearchDraftQuery}
                onHighlightChange={setHighlightedSearchMatchKey}
                onAutocompleteOpenChange={setIsSearchAutocompleteOpen}
                onSubmit={submitItemSearch}
                onResultsOpenChange={setIsSearchResultsOpen}
                onPalettePositionChange={(position) => setSearchPalettePosition((current) =>
                  current?.left === position.left && current.top === position.top ? current : position)}
                onSelectOutpost={selectOutpost}
              />}
              onToggleResource={toggleLocalResource}
              onToggleExplicitResourcePresence={toggleExplicitResourcePresence}
              onToggleActiveProduction={toggleActiveProduction}
              onCommitManufacturing={commitManufacturing}
            />}

            {selectedOutpost && <PlannedSupplyEditor
              resources={resources}
              products={products}
              plannedSupply={selectedOutpost.plannedSupply ?? []}
              actuallyAvailableItems={actuallyAvailableItems}
              onTogglePlannedSupply={togglePlannedSupply}
            />}
          </>
        }

        right={
          selectedOutpost ? <CargoPadsEditor
            key={`${activeSavedNetwork.id}:${effectiveSelectedOutpostId}:${cargoPresentationEpoch}`}
            outpost={selectedOutpost}
            maxCargoPads={maxCargoPads}
            allOutposts={network.outposts}
            cargoLinks={network.cargoLinks}
            resources={resources}
            products={products}
            availableItems={availableCargoItems}
            actuallyAvailableItems={actuallyAvailableItems}
            onAddCargoPad={() =>
              addCargoPad(selectedOutpost.id)
            }
            onMoveCargoPad={(cargoPadId, finalIndex) =>
              moveCargoPadToIndex(
                selectedOutpost.id,
                cargoPadId,
                finalIndex,
              )
            }
            onMoveCargoPadUp={(cargoPadId) =>
              moveCargoPadUp(
                selectedOutpost.id,
                cargoPadId,
              )
            }
            onMoveCargoPadDown={(cargoPadId) =>
              moveCargoPadDown(
                selectedOutpost.id,
                cargoPadId,
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
            onUnlinkCargoPad={(cargoPadId) =>
              unlinkCargoPad(
                selectedOutpost.id,
                cargoPadId,
              )
            }
            onSetCargoLink={(
              localCargoPadId,
              remoteOutpostId,
              remoteCargoPadId,
            ) =>
              setCargoLink(
                selectedOutpost.id,
                localCargoPadId,
                remoteOutpostId,
                remoteCargoPadId,
              )
            }
          /> : null
        }
      />
      
      <StatusBar
        persistentWarning={persistenceStatus.kind === 'saved' ? undefined :
          t(persistenceStatus.kind === 'recovery-fallback'
            ? 'status.storage.recovery' : persistenceStatus.kind === 'storage-unavailable' &&
              persistenceStatus.reason === 'read-failed'
              ? 'status.storage.unavailable' : persistenceStatus.kind === 'unsaved' &&
                persistenceStatus.reason === 'capacity-exceeded'
                ? 'status.storage.capacity' : 'status.storage.unsaved')}
        interactionHint={
          isOutpostDragging
            ? t('status.drag.reorder')
            : undefined
        }
        main={
          <>
            <ValidationSummary
              issues={validationIssues}
              outposts={network.outposts}
              referenceData={referenceData}
              onNavigateToIssue={(issue) => {
                if (
                  issue.outpostId &&
                  network.outposts.some((outpost) => outpost.id === issue.outpostId)
                ) {
                  selectOutpost(issue.outpostId)
                }
              }}
            />

          </>
        }
        message={
          statusMessage
            ? {
                kind: statusMessage.kind,
                content: renderStatusMessage(statusMessage),
                announcementText: getStatusMessageText(statusMessage),
                announcementId: statusMessage.id,
                deferAssertiveUntilWindowFocus:
                  statusMessage.kind === 'error' &&
                  statusMessage.deferAnnouncementUntilWindowFocus,
                onDismiss:
                  statusMessage.kind === 'error'
                    ? () => setStatusMessage(null)
                    : undefined,
              }
            : undefined
        }
      />

      {isDeleteNetworkDialogOpen && (
        <ConfirmDialog
          title={collection.networks.length === 1
            ? t('network.reset.confirmTitle')
            : t('network.delete.confirmTitle')}
          confirmLabel={collection.networks.length === 1
            ? t('network.reset.button')
            : t('network.delete.button')}
          onCancel={() => setIsDeleteNetworkDialogOpen(false)}
          onConfirm={deleteOrResetNetwork}
        >
          <p>{collection.networks.length === 1
            ? t('network.reset.explanation')
            : t('network.delete.explanation')}</p>
          <p>{t('network.delete.undoHint')}</p>
        </ConfirmDialog>
      )}

      {isAboutDialogOpen && (
        <AboutDialog onClose={() => setIsAboutDialogOpen(false)} />
      )}

    </main>
  )
}

export default App
