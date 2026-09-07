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

import {
  useEffect,
  useState,
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

interface CargoPadsEditorProps {
  outpost: Outpost
  maxCargoPads: number | null
  allOutposts: Outpost[]
  cargoLinks: CargoLink[]
  onUnlinkCargoPad: (
    cargoPadId: string,
  ) => void
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
}

interface ActiveDrag {
  cargoPadId: string
  insertionIndex: number | null
}

export function CargoPadsEditor({
  outpost,
  maxCargoPads,
  allOutposts,
  cargoLinks,
  resources,
  products,
  availableItems,
  actuallyAvailableItems,
  onUnlinkCargoPad,
  onSetCargoLink,
  onAddCargoPad,
  onMoveCargoPad,
  onMoveCargoPadUp,
  onMoveCargoPadDown,
  onDeleteCargoPad,
  onToggleExport,
  onToggleCargoPadType,
}: CargoPadsEditorProps) {
  /*
   * Selecting an outpost does not by itself constitute a cargo link.
   * Keep that partial selection in UI state until the user chooses a
   * specific remote cargo pad, at which point a CargoLink can be created.
   */
  const [draftLinkedOutpostIds, setDraftLinkedOutpostIds] =
    useState<Record<string, string>>({})

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
  function toggleAllCargoPads() {
    setExpandedPadIds((current) => {
      const updated = { ...current }

      for (const pad of outpost.cargoPads) {
        if (areAllCargoPadsExpanded) {
          delete updated[pad.id]
        } else {
          updated[pad.id] = true
        }
      }

      return updated
    })
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
      name: reference?.name ?? item.id,
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
   * Finds the single network-level cargo link involving this pad.
   *
   * A Starfield cargo pad can participate in at most one cargo link,
   * so callers expect either one relationship or no relationship.
   */
  function findCargoLink(padId: string) {
    return cargoLinks.find(
      (link) =>
        (
          link.endpointA.outpostId === outpost.id &&
          link.endpointA.cargoPadId === padId
        ) ||
        (
          link.endpointB.outpostId === outpost.id &&
          link.endpointB.cargoPadId === padId
        ),
    )
  }

  /**
   * Returns the endpoint at the opposite side of a bidirectional link.
   *
   * endpointA and endpointB have no source/destination meaning, so the
   * local pad may appear on either side of the stored relationship.
   */
  function getRemoteEndpoint(
    link: CargoLink,
    localPadId: string,
  ) {
    const localIsEndpointA =
      link.endpointA.outpostId === outpost.id &&
      link.endpointA.cargoPadId === localPadId

    return localIsEndpointA
      ? link.endpointB
      : link.endpointA
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
  ): string {
    const destinationOutpost = allOutposts.find(
      (candidate) => candidate.id === destinationOutpostId,
    )

    const destinationPad = destinationOutpost?.cargoPads.find(
      (candidate) => candidate.id === destinationPadId,
    )

    if (!destinationOutpost || !destinationPad) {
      return 'Unknown cargo pad'
    }

  /*
  * Destination-pad labels are primarily identifiers, so use compact
  * reference-data abbreviations here rather than full cargo-item names.
  *
  * The full names remain available elsewhere in the editor and through
  * the compact cargo-pad summary tooltips.
  */
  const outboundShortNames =
    destinationPad.outboundItems.map((item) => {
      if (item.type === 'resource') {
        return (
          resources.find(
            (resource) => resource.id === item.id,
          )?.shortName ?? item.id
        )
      }

      return (
        products.find(
          (product) => product.id === item.id,
        )?.shortName ?? item.id
      )
    })

  const outboundLabel =
    outboundShortNames.length > 0
      ? outboundShortNames.join(' ')
      : 'nothing'

    /*
    * A pad can participate in only one network-level CargoLink. If this
    * candidate is already linked, resolve the opposite endpoint so the
    * user can see which existing relationship would be displaced.
    */
    const existingLink = cargoLinks.find(
      (link) =>
        (
          link.endpointA.outpostId === destinationOutpostId &&
          link.endpointA.cargoPadId === destinationPadId
        ) ||
        (
          link.endpointB.outpostId === destinationOutpostId &&
          link.endpointB.cargoPadId === destinationPadId
        ),
    )

    if (!existingLink) {
      return `${destinationPad.label}: (${outboundLabel})`
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
      return `${destinationPad.label}: (${outboundLabel})`
    }

    const otherOutpost = allOutposts.find(
      (candidate) => candidate.id === otherEndpoint.outpostId,
    )

    const otherPad = otherOutpost?.cargoPads.find(
      (candidate) => candidate.id === otherEndpoint.cargoPadId,
    )

    const linkedToLabel =
      otherOutpost && otherPad
        ? `${otherOutpost.name} / ${otherPad.label}`
        : 'unknown cargo pad'

    return (
      `${destinationPad.label}: (${outboundLabel})` +
      ` — linked to ${linkedToLabel}`
    )
  }

  /**
   * Changes the draft remote-outpost selection for one cargo pad.
   *
   * Choosing another outpost removes an established link as one undoable
   * network action, then keeps the new incomplete selection in UI state.
   *
   * Clearing the outpost selection is an explicit unlink action.
   */
  function changeLinkedOutpost(
    localPadId: string,
    linkedOutpostId: string,
  ) {
    const existingLink = findCargoLink(localPadId)
    const remoteEndpoint = existingLink
      ? getRemoteEndpoint(existingLink, localPadId)
      : null
    const currentSelection = existingLink
      ? remoteEndpoint?.outpostId ?? ''
      : draftLinkedOutpostIds[localPadId] ?? ''

    if (linkedOutpostId === currentSelection) {
      return
    }

    if (!linkedOutpostId) {
      if (existingLink) {
        onUnlinkCargoPad(localPadId)
      }

      setDraftLinkedOutpostIds((current) => {
        const updated = { ...current }
        delete updated[localPadId]
        return updated
      })

      return
    }

    if (existingLink) {
      onUnlinkCargoPad(localPadId)
    }

    setDraftLinkedOutpostIds((current) => ({
      ...current,
      [localPadId]: linkedOutpostId,
    }))
  }

  /**
   * Completes creation or replacement of one cargo-link relationship.
   *
   * The application layer owns all persisted mutations because completing this
   * action may remove an existing link from either endpoint before creating the
   * new relationship. Those related effects must form one Undo/Redo step.
   */
  function changeLinkedCargoPad(
    localPadId: string,
    remoteOutpostId: string,
    remotePadId: string,
  ) {
    if (!remoteOutpostId || !remotePadId) {
      return
    }

    onSetCargoLink(
      localPadId,
      remoteOutpostId,
      remotePadId,
    )

    setDraftLinkedOutpostIds((current) => {
      const updated = { ...current }
      delete updated[localPadId]
      return updated
    })
  }

  return (
    <section className="cargo-pads">
      <h2>
        Cargo Pads
        <span className="cargo-pads__count">
          [{outpost.cargoPads.length}
          {maxCargoPads !== null && `/${maxCargoPads}`}]
        </span>
      </h2>

      <div className="cargo-pads__actions">
        <button type="button" onClick={addCargoPad}>
          + Add Cargo Pad
        </button>

        <div className="cargo-pads__action-group">
          <button
            type="button"
            onClick={toggleAllCargoPads}
            disabled={outpost.cargoPads.length === 0}
          >
            {areAllCargoPadsExpanded
              ? 'Collapse all'
              : 'Expand all'}
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
            {isReshuffling ? 'Lock order' : 'Reshuffle'}
          </button>
        </div>
      </div>

      <div
        className={`cargo-pads__list${
          isReshuffling ? ' cargo-pads__list--reshuffling' : ''
        }`}
        role="list"
        onDragOver={updateInsertionPosition}
        onDragLeave={leaveList}
        onDrop={dropCargoPad}
      >
        {outpost.cargoPads.map((pad, index) => {
        const cargoLink = findCargoLink(pad.id)

        const remoteEndpoint = cargoLink
          ? getRemoteEndpoint(cargoLink, pad.id)
          : null

        const remoteOutpost = remoteEndpoint
          ? allOutposts.find(
              (candidate) =>
                candidate.id === remoteEndpoint.outpostId,
            )
          : undefined

        const remotePad = remoteOutpost && remoteEndpoint
          ? remoteOutpost.cargoPads.find(
              (candidate) =>
                candidate.id === remoteEndpoint.cargoPadId,
            )
          : undefined

        /*
         * A completed link determines the selected outpost. Otherwise
         * use any incomplete outpost selection currently held by the UI.
         */
        const hasDraftLinkedOutpost =
          Object.prototype.hasOwnProperty.call(
            draftLinkedOutpostIds,
            pad.id,
          )

        /*
         * Persisted network state wins while a link exists. This makes Undo
         * restore the complete prior pairing even though the replacement
         * outpost remains as presentation-only draft state for Redo.
         */
        const linkedOutpostId =
          remoteEndpoint?.outpostId ??
          (hasDraftLinkedOutpost ? draftLinkedOutpostIds[pad.id] : '')

        const linkedCargoPadId =
          remoteEndpoint?.cargoPadId ?? ''

        const isCollapsed =
          !(expandedPadIds[pad.id] ?? false)

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
                aria-label={`Drag ${pad.label} to reorder`}
                title={`Drag ${pad.label} to reorder`}
                tabIndex={0}
              >
                ⠿
              </span>
            ) : (
              <span
                className="cargo-pads__ordinal"
                aria-hidden="true"
              >
                {index + 1}
              </span>
            )}

            <section className="cargo-pad">
              <div className="cargo-pad__summary">
                <div className="cargo-pad__summary-top">
                  <div className="cargo-pad__identity">
                    <button
                      type="button"
                      onClick={() =>
                        toggleCargoPadCollapsed(pad.id)
                      }
                      aria-expanded={!isCollapsed}
                      aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} ${pad.label}`}
                      title={`${isCollapsed ? 'Expand' : 'Collapse'} ${pad.label}`}
                    >
                      <span aria-hidden="true">{isCollapsed ? '▸' : '▾'}</span>
                    </button>

                    {pad.type === 'interstellar' && (
                      <span
                        className="cargo-pad__interstellar"
                        title="Interstellar cargo link"
                      >
                        [INT]
                      </span>
                    )}
                  </div>

                  <div className="cargo-pad__destination">
                    {remoteOutpost?.name ?? 'Unlinked'}
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
                    ) : null}
                  </div>
                </div>
              </div>

              {!isCollapsed && (
                <div className="cargo-pad__body">
                  <CargoPadEditor
                    pad={pad}
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
                  title={`Move ${pad.label} up`}
                  aria-label={`Move ${pad.label} up`}
                >
                  ↑
                </button>

                <button
                  type="button"
                  onClick={() => onMoveCargoPadDown(pad.id)}
                  disabled={index === outpost.cargoPads.length - 1}
                  title={`Move ${pad.label} down`}
                  aria-label={`Move ${pad.label} down`}
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
