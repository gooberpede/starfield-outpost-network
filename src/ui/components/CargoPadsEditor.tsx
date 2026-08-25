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

import { useState } from 'react'

import type {
  CargoItem,
  CargoLink,
  Outpost,
  Product,
  Resource,
} from '../../domain/models'

import type {
  ItemProvenance,
} from '../../domain/provenance'

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
  getItemProvenance: (
    item: CargoItem,
  ) => ItemProvenance
}

export function CargoPadsEditor({
  outpost,
  maxCargoPads,
  allOutposts,
  cargoLinks,
  resources,
  products,
  availableItems,
  getItemProvenance,
  onUnlinkCargoPad,
  onSetCargoLink,
  onAddCargoPad,
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
  * Missing entries mean "expanded", which preserves the existing behaviour
  * and also causes newly created pads to start expanded automatically.
  */
  const [collapsedPadIds, setCollapsedPadIds] =
    useState<Record<string, boolean>>({})

  /**
   * Expands or collapses one cargo pad independently of the others.
   */
  function toggleCargoPadCollapsed(padId: string) {
    setCollapsedPadIds((current) => ({
      ...current,
      [padId]: !current[padId],
    }))
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
    setCollapsedPadIds((current) => {
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
   * Choosing another outpost does not immediately destroy an existing
   * persisted link. The old relationship remains in the network until the
   * user selects a specific replacement cargo pad, allowing App to replace
   * the complete relationship as one undoable action.
   *
   * Clearing the outpost selection is an explicit unlink action.
   */
  function changeLinkedOutpost(
    localPadId: string,
    linkedOutpostId: string,
  ) {
    if (!linkedOutpostId) {
      if (findCargoLink(localPadId)) {
        onUnlinkCargoPad(localPadId)
      }

      setDraftLinkedOutpostIds((current) => {
        const updated = { ...current }
        delete updated[localPadId]
        return updated
      })

      return
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
    <section>
      <h2>
        Cargo Pads [
        {outpost.cargoPads.length}
        {maxCargoPads !== null && `/${maxCargoPads}`}
        ]
      </h2>

      <button type="button" onClick={addCargoPad}>
        + Add Cargo Pad
      </button>

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

        const linkedOutpostId =
          hasDraftLinkedOutpost
            ? draftLinkedOutpostIds[pad.id]
            : remoteEndpoint?.outpostId ?? ''

        const linkedCargoPadId =
          hasDraftLinkedOutpost
            ? ''
            : remoteEndpoint?.cargoPadId ?? ''

        const isCollapsed =
          collapsedPadIds[pad.id] ?? false

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
          <section
            key={pad.id}
            className="cargo-pad"
          >
            <div className="cargo-pad__summary">
              <div className="cargo-pad__summary-top">
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      toggleCargoPadCollapsed(pad.id)
                    }
                    aria-expanded={!isCollapsed}
                  >
                    {isCollapsed ? '▸' : '▾'}{' '}
                    {pad.label}
                  </button>

                  {' '}

                  <button
                    type="button"
                    onClick={() =>
                      onMoveCargoPadUp(pad.id)
                    }
                    disabled={index === 0}
                    title={`Move ${pad.label} up`}
                    aria-label={`Move ${pad.label} up`}
                  >
                    ↑
                  </button>

                  {' '}

                  <button
                    type="button"
                    onClick={() =>
                      onMoveCargoPadDown(pad.id)
                    }
                    disabled={
                      index === outpost.cargoPads.length - 1
                    }
                    title={`Move ${pad.label} down`}
                    aria-label={`Move ${pad.label} down`}
                  >
                    ↓
                  </button>

                  {pad.type === 'interstellar' && (
                    <span
                      className="cargo-pad__interstellar"
                      title="Interstellar cargo link"
                    >
                      {' '}[INT]
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
              <CargoPadEditor
                pad={pad}
                outposts={allOutposts}
                currentOutpostId={outpost.id}
                resources={resources}
                products={products}
                availableItems={availableItems}
                getItemProvenance={getItemProvenance}
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
            )}
          </section>
        )
      })}
    </section>
  )
}