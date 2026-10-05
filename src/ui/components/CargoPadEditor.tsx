/**
 * CargoPadEditor.tsx
 *
 * Purpose:
 *   Presents the editable details of a single cargo pad, including its
 *   type, outbound contents, and linked outpost/pad selection.
 *
 * Architecture:
 *   This is primarily a presentation component. The CargoPad itself owns
 *   its outbound contents, but cargo-link relationships belong to the
 *   OutpostNetwork and are managed by CargoPadsEditor.
 *
 *   CargoPadEditor therefore receives the current linked outpost and pad
 *   as props and reports requested changes through callbacks. It does not
 *   create, remove, or directly modify CargoLink records.
 *
 * Change this file when:
 *   - the presentation of an individual cargo pad changes;
 *   - new editable pad-level properties are introduced;
 *   - the cargo-link selection interface changes;
 *
 * Do not put network-level cargo-link rules here. Those belong in
 * the cargoConnections domain owner.
 */

import { formatCargoDestination } from '../../localization/cargoDestination.ts'
import { encodeCargoOption as encode, decodeCargoOption as decode } from '../cargoDestinationOptions.ts'
import { useId } from 'react'
import type {
  CargoItem,
  CargoPad,
  Outpost,
  Product,
  Resource,
} from '../../domain/models'
import { contextHelpText } from '../contextHelpText'
import { getInterstellarFuelState } from '../statusStates.ts'

import { CargoExportsEditor } from './CargoExportsEditor'
import { ContextHelp } from './ContextHelp'
import './CargoPadEditor.css'
import { useLocalization } from '../../localization/LocalizationContext.ts'
import { getReferenceDisplayName } from '../../localization/referenceNames.ts'

interface CargoPadEditorProps {
  unavailableOutpost?: boolean
  unavailablePad?: boolean
  blocked?: boolean
  statusText?: string
  onAddRemote?: () => void
  pad: CargoPad
  displayLabel: string
  outposts: Outpost[]
  currentOutpostId: string
  onRemove: () => void
  onToggleExport: (item: CargoItem) => void
  onToggleType: () => void
  resources: Resource[]
  products: Product[]
  availableItems: CargoItem[]
  actuallyAvailableItems: CargoItem[]
  linkedOutpostId: string
  linkedCargoPadId: string
  onLinkedOutpostChange: (outpostId: string) => void
  onLinkedCargoPadChange: (cargoPadId: string) => void

  getDestinationPadLabel: (
    outpostId: string,
    cargoPadId: string,
  ) => string
  getDestinationPadAccessibleLabel?: (
    outpostId: string,
    cargoPadId: string,
  ) => string
}

export function CargoPadEditor({
  unavailableOutpost = false,
  unavailablePad = false,
  blocked = false,
  statusText,
  onAddRemote,
  pad,
  displayLabel,
  outposts,
  currentOutpostId,
  resources,
  products,
  availableItems,
  actuallyAvailableItems,
  onRemove,
  onToggleExport,
  onToggleType,
  linkedOutpostId,
  linkedCargoPadId,
  onLinkedOutpostChange,
  onLinkedCargoPadChange,
  getDestinationPadLabel,
  getDestinationPadAccessibleLabel,
}: CargoPadEditorProps) {
  const { locale, t } = useLocalization()
  const fuelDescriptionId = useId()

  const destinationId = linkedOutpostId
  const destinationPadId = linkedCargoPadId

  const availableDestinations = outposts.filter(
    (outpost) => outpost.id !== currentOutpostId,
  )

  const destinationOutpost = outposts.find(
    (outpost) => outpost.id === destinationId,
  )

  const availableDestinationPads =
    destinationOutpost?.cargoPads ?? []

  const outerValue = blocked || unavailableOutpost ? encode({ kind: 'status' }) : destinationId ? encode({ kind: 'id', id: destinationId }) : encode({ kind: 'empty' })
  const innerValue = unavailablePad ? encode({ kind: 'status' }) : destinationPadId ? encode({ kind: 'id', id: destinationPadId }) : encode({ kind: 'empty' })
  const isInterSystem = pad.type === 'interstellar'
  const hasActualHelium3 = actuallyAvailableItems.some(
    (item) => item.type === 'resource' && item.id === 'helium-3',
  )
  const fuelState = getInterstellarFuelState(isInterSystem, hasActualHelium3)
  const helium3Name = getReferenceDisplayName(
    'resource',
    'helium-3',
    resources.find((resource) => resource.id === 'helium-3')?.name ?? 'Helium-3',
    locale,
  )
  const fuelDescription = isInterSystem
    ? t(hasActualHelium3
        ? 'matrix.tooltip.input.available'
        : 'matrix.tooltip.input.unavailable', { item: helium3Name })
    : null
  const interSystemTooltip = fuelDescription
    ? t('validation.context.separator', {
        outpost: t('cargo.interstellar'),
        pad: fuelDescription,
      })
    : t('cargo.interstellar')

  return (
    <div className="cargo-pad-editor">
      <div className="cargo-pad-editor__controls">
        <div className="cargo-pad-editor__action-row">
          <span className="cargo-pad-editor__inter-system-group">
            <button
              className="cargo-pad-editor__inter-system"
              data-fuelled={isInterSystem && hasActualHelium3}
              data-fuel-state={fuelState}
              type="button"
              aria-pressed={isInterSystem}
              aria-describedby={isInterSystem ? fuelDescriptionId : undefined}
              title={interSystemTooltip}
              onClick={onToggleType}
            >
              {t('cargo.interSystem.button')}
            </button>
            <ContextHelp
              context={t('cargo.interSystem.context')}
              text={t(contextHelpText.interSystem)}
            />
            {isInterSystem && (
              <span id={fuelDescriptionId} className="ui-visually-hidden">
                {fuelDescription}
              </span>
            )}
          </span>

          <button
            type="button"
            onClick={onRemove}
            className="cargo-pad-editor__remove"
            aria-label={t('cargo.pad.remove', { pad: displayLabel })}
          >
            {t('cargo.remove')}
          </button>
        </div>

        <select
          aria-label={t('cargo.destination.outpost')}
          title={destinationOutpost ? formatCargoDestination(locale, destinationOutpost.name, destinationOutpost.cargoPads.length) : statusText ?? destinationId}
          disabled={blocked}
          value={outerValue}
          onChange={(event) => {
            const option = decode(event.currentTarget.value)
            if (option?.kind === 'id') onLinkedOutpostChange(option.id)
            else if (option?.kind === 'empty') onLinkedOutpostChange('')
            event.currentTarget.value = outerValue
          }}
        >
          <option value={encode({ kind: 'empty' })}>{t('cargo.destination.unlinked')}</option>
          {blocked && <option disabled value={encode({ kind: 'status' })}>{statusText}</option>}
          {!blocked && unavailableOutpost && <option disabled value={outerValue}>{t('cargo.destination.missingOutpost', { id: destinationId })}</option>}
          {availableDestinations.map((outpost) => (
            <option key={outpost.id} value={encode({ kind: 'id', id: outpost.id })}>
              {formatCargoDestination(locale, outpost.name, outpost.cargoPads.length)}
            </option>
          ))}
        </select>
        {destinationOutpost && !blocked && (
          <select aria-label={t('cargo.destination.pad')} value={innerValue}
            onChange={(event) => {
              const option = decode(event.currentTarget.value)
              if (option?.kind === 'id') onLinkedCargoPadChange(option.id)
              else if (option?.kind === 'add') onAddRemote?.()
              // A no-op native event must not leave an action or placeholder selected.
              event.currentTarget.value = innerValue
            }}>
            <option value={encode({ kind: 'empty' })}>{t('cargo.destination.selectPad')}</option>
            {unavailablePad &&
              <option disabled value={innerValue}>{t('cargo.destination.missingPad', { id: destinationPadId })}</option>}
            {availableDestinationPads.map((destinationPad) => (
              <option key={destinationPad.id} value={encode({ kind: 'id', id: destinationPad.id })}
                aria-label={(getDestinationPadAccessibleLabel ?? getDestinationPadLabel)(destinationOutpost.id, destinationPad.id)}>
                {getDestinationPadLabel(destinationOutpost.id, destinationPad.id)}
              </option>
            ))}
            <option value={encode({ kind: 'add' })}>{t('cargo.addButton')}</option>
          </select>
        )}
      </div>
      <CargoExportsEditor
        resources={resources}
        products={products}
        availableItems={availableItems}
        exports={pad.outboundItems}
        onToggleExport={onToggleExport}
      />
    </div>
  )
}
