/**
 * CargoPadsEditor.tsx
 *
 * Purpose:
 *   Manages the cargo pads belonging to a single outpost, including
 *   creation, removal, outbound contents, and cargo-link relationships.
 *
 * Architecture:
 *   This component sits between the individual CargoPadEditor UI and the
 *   network-level cargo-link model.
 *
 *   Cargo pads own their outbound contents, but they do not own their
 *   cargo links. A cargo link is a bidirectional relationship stored once
 *   at the OutpostNetwork level and connects two specific cargo pads.
 *
 *   This component therefore resolves network-level CargoLink records
 *   into the local/remote information needed by CargoPadEditor. It also
 *   derives a pad's read-only inbound contents from the outbound contents
 *   of the pad at the opposite end of its cargo link.
 *
 *   The component also presents the current cargo-pad count for the selected
 *   outpost and, when the relevant character skill is known, the calculated
 *   maximum capacity. Capacity calculation itself remains in the domain layer.
 *
 *   Cargo-pad ordering controls are presented here, while the persisted
 *   reorder operation is delegated to the application layer so each move can
 *   participate in Undo/Redo history.
 *
 * Key rules:
 *   - A cargo pad may contain outbound items while unlinked.
 *   - A cargo pad may participate in at most one cargo link.
 *   - A completed outpost cargo link always connects two specific pads.
 *   - Cargo links are bidirectional; neither endpoint is inherently the
 *     source or destination.
 *   - Inbound contents are derived and are never stored independently.
 *   - Selecting a destination outpost alone does not create a cargo link;
 *     a specific destination cargo pad must also be selected.
 *
 * Change this file when:
 *   - cargo-link creation or removal behaviour changes;
 *   - rules governing which pads may be linked change;
 *   - inbound cargo derivation changes;
 *   - cargo-pad ordering or lifecycle behaviour changes;
 *   - the UI needs additional derived information about the remote end
 *     of a cargo link.
 */

import { classifyCargoDestination, incident } from '../../domain/cargoConnections.ts'
import {
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react'
import type { DragEvent } from 'react'

import type {
  CargoItem,
  CargoLink,
  Outpost,
  Product,
  Resource,
} from '../../domain/models'

import { CargoPadEditor } from './CargoPadEditor'
import './CargoPadsEditor.css'
import { useLocalization } from '../../localization/LocalizationContext.ts'
import { formatInteger, formatList } from '../../localization/formatters.ts'
import { getReferenceDisplayName } from '../../localization/referenceNames.ts'
import { focusAndReveal } from '../focusVisibility.ts'
import type { CargoPadHistoryPresentationChange } from '../../domain/collectionEditingSession.ts'

interface CargoPadsEditorProps {
  commandRef?: RefObject<CargoPadsEditorCommands | null>
  outpost: Outpost
  maxCargoPads: number | null
  allOutposts: Outpost[]
  cargoLinks: CargoLink[]
  onSelectDestination: (padId: string, target: string) => void
  onAddRemote: (padId: string, target: string) => void
  onRemovePairing: (padId: string, record: CargoLink) => void
  onSetCargoLink: (
    localCargoPadId: string,
    remoteOutpostId: string,
    remoteCargoPadId: string,
  ) => void
  onAddCargoPad: () => void
  onMoveCargoPad: (
    cargoPadId: string,
    finalIndex: number,
  ) => void
  onMoveCargoPadUp: (
    cargoPadId: string,
  ) => void
  onMoveCargoPadDown: (
    cargoPadId: string,
  ) => void
  onDeleteCargoPad: (cargoPadId: string) => void
  onToggleExport: (
    cargoPadId: string,
    item: CargoItem,
  ) => void
  onToggleCargoPadType: (
    cargoPadId: string,
  ) => void
  resources: Resource[]
  products: Product[]
  availableItems: CargoItem[]
  actuallyAvailableItems: CargoItem[]
  historyPresentationChange?: CargoPadHistoryPresentationChange | null
}

export interface CargoPadsEditorCommands {
  addFromShortcut: () => boolean
  setAllExpanded: (expanded: boolean) => boolean
  focusRegion: () => boolean
}

interface ActiveDrag {
  cargoPadId: string
  insertionIndex: number | null
}

export function CargoPadsEditor({
  commandRef,
  outpost,
  maxCargoPads,
  allOutposts,
  cargoLinks,
  resources,
  products,
  availableItems,
  actuallyAvailableItems,
  onSelectDestination,
  onAddRemote,
  onRemovePairing,
  onSetCargoLink,
  onAddCargoPad,
  onMoveCargoPad,
  onMoveCargoPadUp,
  onMoveCargoPadDown,
  onDeleteCargoPad,
  onToggleExport,
  onToggleCargoPadType,
  historyPresentationChange,
}: CargoPadsEditorProps) {
  const { locale, t } = useLocalization()
  const cargoNetwork = { outposts: allOutposts, cargoLinks }
  /*
  * Collapse state is presentation-only and deliberately does not belong in
  * the persisted outpost/network model.
  *
  * Missing entries mean "collapsed", so pads loaded with a network and pads
  * created during the current session both begin in the compact state.
  */
  const [expandedPadIds, setExpandedPadIds] =
    useState<Record<string, boolean>>({})
  const [isReshuffling, setIsReshuffling] = useState(false)
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null)
  const [previousCargoPadCount, setPreviousCargoPadCount] =
    useState(outpost.cargoPads.length)
  const regionRef = useRef<HTMLElement>(null)
  const localCommandRef = useRef<CargoPadsEditorCommands>(null)
  const effectiveCommandRef = commandRef ?? localCommandRef
  const lastDisclosureRef = useRef<HTMLButtonElement>(null)
  const focusAddedPadRef = useRef(false)
  const [appliedHistoryPresentationChange, setAppliedHistoryPresentationChange] =
    useState<CargoPadHistoryPresentationChange | null>(null)

  const isDragActive = activeDrag !== null
  const canReshuffle = outpost.cargoPads.length >= 2

  /*
   * Adjust presentation state before committing a render with an invalid
   * reshuffle mode. This also covers pad-count changes caused by Undo.
   */
  if (previousCargoPadCount !== outpost.cargoPads.length) {
    setPreviousCargoPadCount(outpost.cargoPads.length)

    if (!canReshuffle && isReshuffling) {
      setActiveDrag(null)
      setIsReshuffling(false)
    }
  }

  if (historyPresentationChange &&
    historyPresentationChange !== appliedHistoryPresentationChange &&
    historyPresentationChange.outpostId === outpost.id) {
    setAppliedHistoryPresentationChange(historyPresentationChange)
    setExpandedPadIds((current) => {
      const updated = { ...current }
      if (historyPresentationChange.expanded &&
        outpost.cargoPads.some(({ id }) => id === historyPresentationChange.cargoPadId)) {
        updated[historyPresentationChange.cargoPadId] = true
      } else {
        delete updated[historyPresentationChange.cargoPadId]
      }
      return updated
    })
  }

  function clearDrag() {
    setActiveDrag(null)
  }

  useEffect(() => {
    if (!isDragActive) {
      return
    }

    function cancelWithEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        clearDrag()
      }
    }

    document.addEventListener('keydown', cancelWithEscape)

    return () => {
      document.removeEventListener('keydown', cancelWithEscape)
    }
  }, [isDragActive])

  useLayoutEffect(() => {
    if (!focusAddedPadRef.current) return
    focusAddedPadRef.current = false
    focusAndReveal(lastDisclosureRef.current)
  }, [outpost.cargoPads.length])

  const areAllCargoPadsExpanded =
    outpost.cargoPads.length > 0 &&
    outpost.cargoPads.every(
      (pad) => expandedPadIds[pad.id] ?? false,
    )

  /**
   * Expands or collapses one cargo pad independently of the others.
   */
  function toggleCargoPadCollapsed(padId: string) {
    setExpandedPadIds((current) => ({
      ...current,
      [padId]: !current[padId],
    }))
  }

  /**
   * Expands or collapses every cargo pad on the selected outpost while
   * preserving the presentation state of pads belonging to other outposts.
   */
  function setAllCargoPadsExpanded(expanded: boolean) {
    if (outpost.cargoPads.length === 0) return false
    setExpandedPadIds((current) => {
      const updated = { ...current }

      for (const pad of outpost.cargoPads) {
        if (!expanded) {
          delete updated[pad.id]
        } else {
          updated[pad.id] = true
        }
      }

      return updated
    })
    return true
  }

  function toggleAllCargoPads() {
    setAllCargoPadsExpanded(!areAllCargoPadsExpanded)
  }

  function startDrag(
    event: DragEvent<HTMLSpanElement>,
    cargoPadId: string,
  ) {
    if (!isReshuffling) {
      event.preventDefault()
      return
    }

    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', cargoPadId)
    setActiveDrag({ cargoPadId, insertionIndex: null })
  }

  /** Maps the pointer to gaps between stationary, whole cargo-pad cards. */
  function updateInsertionPosition(event: DragEvent<HTMLDivElement>) {
    if (!activeDrag) {
      return
    }

    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'

    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        '.cargo-pads__item',
      ),
    )
    const insertionIndex = items.findIndex((item) => {
      const bounds = item.getBoundingClientRect()
      return event.clientY < bounds.top + bounds.height / 2
    })
    const candidateInsertionIndex =
      insertionIndex === -1 ? items.length : insertionIndex
    const sourceIndex = outpost.cargoPads.findIndex(
      (pad) => pad.id === activeDrag.cargoPadId,
    )
    const candidateFinalIndex =
      candidateInsertionIndex > sourceIndex
        ? candidateInsertionIndex - 1
        : candidateInsertionIndex
    const nextInsertionIndex =
      candidateFinalIndex === sourceIndex
        ? null
        : candidateInsertionIndex

    if (nextInsertionIndex !== activeDrag.insertionIndex) {
      setActiveDrag({
        ...activeDrag,
        insertionIndex: nextInsertionIndex,
      })
    }
  }

  function leaveList(event: DragEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect()
    const isOutside =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom

    if (isOutside && activeDrag) {
      setActiveDrag({ ...activeDrag, insertionIndex: null })
    }
  }

  function dropCargoPad(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()

    if (!activeDrag || activeDrag.insertionIndex === null) {
      clearDrag()
      return
    }

    const sourceIndex = outpost.cargoPads.findIndex(
      (pad) => pad.id === activeDrag.cargoPadId,
    )
    const finalIndex =
      activeDrag.insertionIndex > sourceIndex
        ? activeDrag.insertionIndex - 1
        : activeDrag.insertionIndex

    onMoveCargoPad(activeDrag.cargoPadId, finalIndex)
    clearDrag()
  }

  /**
   * Resolves a stored CargoItem to the reference-data names used by the
   * compact pad summary.
   *
   * shortName is displayed; name is retained for the mouse-over tooltip.
   * Falling back to the stored ID keeps an unexpected reference visible
   * rather than silently omitting it.
   */
  function getCargoItemDisplay(item: CargoItem) {
    const reference =
      item.type === 'resource'
        ? resources.find(
            (resource) => resource.id === item.id,
          )
        : products.find(
            (product) => product.id === item.id,
          )

    return {
      shortName: reference?.shortName ?? item.id,
      name: getReferenceDisplayName(
        item.type,
        item.id,
        reference?.name ?? item.id,
        locale,
      ),
    }
  }

  /**
   * Requests creation of a new unlinked cargo pad for the current outpost.
   *
   * The persisted network mutation is owned by the application layer so cargo
   * pad creation can participate in the same Undo/Redo command architecture as
   * cargo pad deletion and other semantic network actions.
   */
  function addCargoPad() {
    onAddCargoPad()
  }

  /**
   * Requests deletion of one cargo pad.
   *
   * The actual network mutation is owned by the application layer because
   * deleting a cargo pad may also remove a network-level cargo link. Treating
   * those related changes as one operation allows them to share one Undo/Redo
   * history entry.
   */
  function removeCargoPad(padId: string) {
    onDeleteCargoPad(padId)

    /*
    * Collapse state is presentation-only, so it can be discarded locally
    * when the corresponding persisted cargo pad is removed.
    */
    setExpandedPadIds((current) => {
      const updated = { ...current }
      delete updated[padId]
      return updated
    })
  }

  /**
   * Builds the descriptive label shown for a possible destination pad.
   *
   * The label exposes information that helps the user choose the intended
   * pad without changing the underlying cargo-link model. It shows both
   * the pad's current outbound contents and whether that pad already
   * participates in another cargo link.
   *
   * Example:
   *   Pad 3: (Iron; Alkanes) — linked to Outpost A / Pad 1
   */
  function getDestinationPadLabel(
    localPadId: string,
    destinationOutpostId: string,
    destinationPadId: string,
    useFullItemNames = false,
  ): string {
    const destinationOutpost = allOutposts.find(
      (candidate) => candidate.id === destinationOutpostId,
    )

    const destinationPad = destinationOutpost?.cargoPads.find(
      (candidate) => candidate.id === destinationPadId,
    )

    if (!destinationOutpost || !destinationPad) {
      return t('cargo.destination.unknownPad')
    }

    const destinationPadOrdinal = destinationOutpost.cargoPads.findIndex(
      ({ id }) => id === destinationPadId,
    ) + 1
    const destinationPadDisplayLabel = t('cargo.pad.summary', {
      ordinal: formatInteger(locale, destinationPadOrdinal),
    })

  /*
  * Destination-pad labels are primarily identifiers, so use compact
  * reference-data abbreviations here rather than full cargo-item names.
  *
  * The full names remain available elsewhere in the editor and through
  * the compact cargo-pad summary tooltips.
  */
  const outboundItemNames = destinationPad.outboundItems.map((item) => {
    const display = getCargoItemDisplay(item)
    return useFullItemNames ? display.name : display.shortName
  })

  const outboundLabel =
    outboundItemNames.length > 0
      ? useFullItemNames
        ? formatList(locale, outboundItemNames)
        : outboundItemNames.join(' ')
      : t('cargo.destination.nothing')

    /*
    * A pad can participate in only one network-level CargoLink. If this
    * candidate is already linked, resolve the opposite endpoint so the
    * user can see which existing relationship would be displaced.
    */
    const destinationState = classifyCargoDestination(cargoNetwork, { outpostId: destinationOutpostId, cargoPadId: destinationPadId })
    if (destinationState.kind === 'conflict' || destinationState.kind === 'self-reference') {
      return t('cargo.destination.padContentsLinked', { pad: destinationPadDisplayLabel, contents: outboundLabel,
        destination: t(destinationState.kind === 'conflict' ? 'validation.cargoPairingConflict' : 'validation.selfLinkedCargoPad') })
    }
    const existingLink = 'link' in destinationState ? destinationState.link : undefined

    if (!existingLink) {
      return t('cargo.destination.padContents', { pad: destinationPadDisplayLabel, contents: outboundLabel })
    }

    const destinationIsEndpointA =
      existingLink.endpointA.outpostId === destinationOutpostId &&
      existingLink.endpointA.cargoPadId === destinationPadId

    const otherEndpoint = destinationIsEndpointA
      ? existingLink.endpointB
      : existingLink.endpointA

    /*
    * If the candidate destination pad is already linked to the local pad
    * being edited, this is the current relationship rather than a competing
    * one. Suppress the redundant "linked to" label in that case.
    */
    const isCurrentRelationship =
      otherEndpoint.outpostId === outpost.id &&
      otherEndpoint.cargoPadId === localPadId

    if (isCurrentRelationship) {
      return t('cargo.destination.padContents', { pad: destinationPadDisplayLabel, contents: outboundLabel })
    }

    const otherOutpost = allOutposts.find(
      (candidate) => candidate.id === otherEndpoint.outpostId,
    )

    const otherPad = otherOutpost?.cargoPads.find(
      (candidate) => candidate.id === otherEndpoint.cargoPadId,
    )

    const linkedToLabel =
      otherOutpost && otherPad
        ? t('cargo.destination.linkedLocator', {
            outpost: otherOutpost.name,
            pad: t('cargo.pad.summary', {
              ordinal: formatInteger(
                locale,
                otherOutpost.cargoPads.findIndex(({ id }) => id === otherPad.id) + 1,
              ),
            }),
          })
        : t('cargo.destination.unknownPadInline')

    return t('cargo.destination.padContentsLinked', {
      pad: destinationPadDisplayLabel, contents: outboundLabel, destination: linkedToLabel,
    })
  }

  function changeLinkedOutpost(localPadId: string, target: string) {
    onSelectDestination(localPadId, target)
  }
  function changeLinkedCargoPad(localPadId: string, remoteOutpostId: string, remotePadId: string) {
    if (remoteOutpostId && remotePadId) onSetCargoLink(localPadId, remoteOutpostId, remotePadId)
  }
  function endpointLabel(endpoint: { outpostId: string; cargoPadId: string }): string {
    const parent = allOutposts.find(({ id }) => id === endpoint.outpostId)
    const ordinal = parent?.cargoPads.findIndex(({ id }) => id === endpoint.cargoPadId) ?? -1
    return (parent?.name || endpoint.outpostId) + ' / ' + (ordinal < 0 ? endpoint.cargoPadId : t('cargo.pad.summary', { ordinal: formatInteger(locale, ordinal + 1) })) + ' [' + JSON.stringify([endpoint.outpostId, endpoint.cargoPadId]) + ']'
  }

  useImperativeHandle(effectiveCommandRef, () => ({
    addFromShortcut: () => {
      focusAddedPadRef.current = true
      addCargoPad()
      return true
    },
    setAllExpanded: setAllCargoPadsExpanded,
    focusRegion: () => {
      const region = regionRef.current
      if (!region) return false
      return focusAndReveal(region, { showFocusRing: true })
    },
  }))

  return (
    <section ref={regionRef} tabIndex={-1} className="cargo-pads" aria-label={t('cargo.heading')}>
      <div className="cargo-pads__heading">
        <h2>{t('cargo.heading')}</h2>
        <span className="cargo-pads__count">
          [{outpost.cargoPads.length}
          {maxCargoPads !== null && `/${maxCargoPads}`}]
        </span>
      </div>

      <div className="cargo-pads__actions">
        <button
          type="button"
          onClick={addCargoPad}
          aria-label={t('cargo.addButton')}
          title={t('cargo.addButton')}
        >
          {t('common.add')}
        </button>

        <div className="cargo-pads__action-group">
          <button
            type="button"
            onClick={toggleAllCargoPads}
            disabled={outpost.cargoPads.length === 0}
          >
            {areAllCargoPadsExpanded
              ? t('cargo.collapseAll')
              : t('cargo.expandAll')}
          </button>

          <button
            type="button"
            onClick={() => {
              if (!canReshuffle) {
                return
              }

              clearDrag()
              setIsReshuffling((current) => !current)
            }}
            disabled={!canReshuffle}
            aria-pressed={isReshuffling}
          >
            {isReshuffling ? t('cargo.lockOrder') : t('cargo.reshuffleButton')}
          </button>
        </div>
      </div>

      <div
        className={`cargo-pads__list technical-scrollbar${
          isReshuffling ? ' cargo-pads__list--reshuffling' : ''
        }`}
        role="list"
        onDragOver={updateInsertionPosition}
        onDragLeave={leaveList}
        onDrop={dropCargoPad}
      >
        {outpost.cargoPads.map((pad, index) => {
        const owner = { outpostId: outpost.id, cargoPadId: pad.id }
        const destination = classifyCargoDestination(cargoNetwork, owner)
        const remoteEndpoint = destination.kind === 'connected' ? destination.target : null
        const remoteOutpost = remoteEndpoint ? allOutposts.find(({ id }) => id === remoteEndpoint.outpostId) : undefined
        const remotePad = remoteOutpost?.cargoPads.find(({ id }) => id === remoteEndpoint?.cargoPadId)
        const linkedOutpostId = 'target' in destination ? destination.target.outpostId : ''
        const linkedCargoPadId = destination.kind === 'connected' || destination.kind === 'missing-pad' ? destination.target.cargoPadId : ''
        const targetName = allOutposts.find(({ id }) => id === linkedOutpostId)?.name || linkedOutpostId
        const destinationText = destination.kind === 'connected' || destination.kind === 'incomplete' ? targetName
          : destination.kind === 'missing-outpost' ? t('cargo.destination.missingOutpost', { id: linkedOutpostId })
          : destination.kind === 'missing-pad' ? targetName + ' — ' + t('cargo.destination.missingPad', { id: linkedCargoPadId })
          : destination.kind === 'conflict' ? t('validation.cargoPairingConflict')
          : destination.kind === 'self-reference' ? t('validation.selfLinkedCargoPad')
          : t('cargo.destination.unlinked')
        const destinationDescription = destination.kind === 'incomplete'
          ? t('cargo.destination.incomplete', { outpost: targetName }) : destinationText
        const repairRecords = destination.kind === 'conflict' ? destination.records
          : 'link' in destination && destination.link && destination.kind !== 'connected' ? [destination.link] : []

        const isCollapsed =
          !(expandedPadIds[pad.id] ?? false)
        const displayPadLabel = t('cargo.pad.summary', {
          ordinal: formatInteger(locale, index + 1),
        })

        const outboundSummaryItems =
          pad.outboundItems.map(
            getCargoItemDisplay,
          )

        const inboundSummaryItems =
          remotePad
            ? remotePad.outboundItems.map(
                getCargoItemDisplay,
              )
            : []
        const semanticSummaryId = `cargo-pad-semantic-summary-${pad.id}`
        const semanticSummary = t('cargo.pad.semanticSummary', {
          destination: destinationDescription,
          outbound: outboundSummaryItems.length > 0
            ? formatList(locale, outboundSummaryItems.map(({ name }) => name))
            : t('cargo.pad.noOutboundCargo'),
          inbound: remotePad && inboundSummaryItems.length > 0
            ? formatList(locale, inboundSummaryItems.map(({ name }) => name))
            : t('cargo.pad.noInboundCargo'),
          linkType: t(pad.type === 'interstellar'
            ? 'cargo.pad.linkType.interSystem'
            : 'cargo.pad.linkType.standard'),
        })

        return (
          <div
            key={pad.id}
            className={`cargo-pads__item${
              activeDrag?.cargoPadId === pad.id
                ? ' cargo-pads__item--dragging'
                : ''
            }${
              activeDrag?.insertionIndex === index
                ? ' cargo-pads__item--marker-before'
                : ''
            }`}
            role="listitem"
          >
            {isReshuffling ? (
              <span
                className="cargo-pads__drag-handle"
                draggable
                onDragStart={(event) => startDrag(event, pad.id)}
                onDragEnd={clearDrag}
                aria-hidden="true"
                title={t('common.dragToReorder', { item: displayPadLabel })}
                tabIndex={-1}
              >
                ⠿
              </span>
            ) : (
              <span
                className="cargo-pads__ordinal"
                aria-hidden="true"
              >
                {formatInteger(locale, index + 1)}
              </span>
            )}

            <section className="cargo-pad">
              <div className="cargo-pad__summary">
                <div className="cargo-pad__summary-top">
                  <div className="cargo-pad__identity">
                    <button
                      ref={index === outpost.cargoPads.length - 1 ? lastDisclosureRef : undefined}
                      type="button"
                      onClick={() =>
                        toggleCargoPadCollapsed(pad.id)
                      }
                      aria-expanded={!isCollapsed}
                      aria-describedby={isCollapsed ? semanticSummaryId : undefined}
                      aria-label={t(isCollapsed ? 'common.expandItem' : 'common.collapseItem', { item: displayPadLabel })}
                      title={t(isCollapsed ? 'common.expandItem' : 'common.collapseItem', { item: displayPadLabel })}
                    >
                      <span aria-hidden="true">{isCollapsed ? '▸' : '▾'}</span>
                    </button>

                    {isCollapsed && (
                      <span id={semanticSummaryId} className="ui-visually-hidden">
                        {semanticSummary}
                      </span>
                    )}

                    {pad.type === 'interstellar' && (
                      <span
                        className="cargo-pad__interstellar"
                        role="img"
                        title={t('cargo.interstellar')}
                        aria-label={t('cargo.interstellar')}
                      >
                        <span aria-hidden="true">✷⇄✷</span>
                      </span>
                    )}
                  </div>

                  <div
                    className="cargo-pad__destination"
                    title={destinationDescription}
                  >
                    {destinationText}
                  </div>
                </div>

                <div className="cargo-pad__summary-cargo">
                  <div className="cargo-pad__outbound-summary">
                    {outboundSummaryItems.length > 0 ? (
                      outboundSummaryItems.map(
                        (item, index) => (
                          <span
                            key={`${item.name}-${index}`}
                            title={item.name}
                          >
                            {index > 0 && ' '}
                            {item.shortName}
                          </span>
                        ),
                      )
                    ) : (
                      <span>—</span>
                    )}
                  </div>

                  <div className="cargo-pad__inbound-summary">
                    {remotePad ? (
                      inboundSummaryItems.length > 0 ? (
                        inboundSummaryItems.map(
                          (item, index) => (
                            <span
                              key={`${item.name}-${index}`}
                              title={item.name}
                            >
                              {index > 0 && ' '}
                              {item.shortName}
                            </span>
                          ),
                        )
                      ) : (
                        <span>—</span>
                      )
                    ) : destination.kind === 'incomplete' ? <span>{t('cargo.pad.noRemoteLink')}</span> : null}
                  </div>
                </div>
              </div>

              {!isCollapsed && (
                <div className="cargo-pad__body">
                  {repairRecords.length > 0 && <div className="cargo-pad__repair">
                    <strong>{t('cargo.pairing.records')}</strong>
                    {repairRecords.map((record) => {
                      const endpoints = endpointLabel(record.endpointA) + ' ↔ ' + endpointLabel(record.endpointB)
                      return <div key={record.id} title={record.id + ': ' + endpoints}>
                        <div>{record.id}: {endpoints}</div>
                        {incident(record, owner) && <button type="button"
                          aria-label={t('cargo.pairing.removeLabel', { id: record.id, endpoints })}
                          onClick={() => onRemovePairing(pad.id, record)}>{t('cargo.pairing.remove')}</button>}
                      </div>
                    })}
                  </div>}
                  <CargoPadEditor
                    unavailableOutpost={destination.kind === 'missing-outpost'}
                    unavailablePad={destination.kind === 'missing-pad'}
                    blocked={destination.kind === 'conflict' || destination.kind === 'self-reference'}
                    statusText={destinationText}
                    onAddRemote={() => onAddRemote(pad.id, linkedOutpostId)}
                    pad={pad}
                    displayLabel={displayPadLabel}
                    outposts={allOutposts}
                    currentOutpostId={outpost.id}
                    resources={resources}
                    products={products}
                    availableItems={availableItems}
                    actuallyAvailableItems={actuallyAvailableItems}
                    onRemove={() => removeCargoPad(pad.id)}
                    onToggleExport={(item) =>
                      onToggleExport(
                        pad.id,
                        item,
                      )
                    }
                    onToggleType={() =>
                      onToggleCargoPadType(
                        pad.id,
                      )
                    }
                    linkedOutpostId={linkedOutpostId}
                    linkedCargoPadId={linkedCargoPadId}
                    onLinkedOutpostChange={(outpostId) =>
                      changeLinkedOutpost(
                        pad.id,
                        outpostId,
                      )
                    }
                    onLinkedCargoPadChange={(cargoPadId) =>
                      changeLinkedCargoPad(
                        pad.id,
                        linkedOutpostId,
                        cargoPadId,
                      )
                    }
                    getDestinationPadLabel={(
                      destinationOutpostId,
                      destinationPadId,
                    ) =>
                      getDestinationPadLabel(
                        pad.id,
                        destinationOutpostId,
                        destinationPadId,
                      )
                    }
                    getDestinationPadAccessibleLabel={(
                      destinationOutpostId,
                      destinationPadId,
                    ) =>
                      getDestinationPadLabel(
                        pad.id,
                        destinationOutpostId,
                        destinationPadId,
                        true,
                      )
                    }
                  />
                </div>
              )}
            </section>

            {isReshuffling && (
              <span className="cargo-pads__move-controls">
                <button
                  type="button"
                  onClick={() => onMoveCargoPadUp(pad.id)}
                  disabled={index === 0}
                  title={t('common.moveUp', { item: displayPadLabel })}
                  aria-label={t('common.moveUp', { item: displayPadLabel })}
                >
                  ↑
                </button>

                <button
                  type="button"
                  onClick={() => onMoveCargoPadDown(pad.id)}
                  disabled={index === outpost.cargoPads.length - 1}
                  title={t('common.moveDown', { item: displayPadLabel })}
                  aria-label={t('common.moveDown', { item: displayPadLabel })}
                >
                  ↓
                </button>
              </span>
            )}
          </div>
          )
        })}

        {activeDrag?.insertionIndex === outpost.cargoPads.length && (
          <div className="cargo-pads__end-marker" aria-hidden="true" />
        )}
      </div>
    </section>
  )
}
