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
 * CargoPadsEditor or, later, in dedicated domain/data services.
 */

import type {
  CargoItem,
  CargoPad,
  Outpost,
  Product,
  Resource,
} from '../../domain/models'
import { contextHelpText } from '../contextHelpText'

import { CargoExportsEditor } from './CargoExportsEditor'
import { ContextHelp } from './ContextHelp'
import './CargoPadEditor.css'

interface CargoPadEditorProps {
  pad: CargoPad
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
}

export function CargoPadEditor({
  pad,
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
}: CargoPadEditorProps) {

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

  const isInterSystem = pad.type === 'interstellar'
  const hasActualHelium3 = actuallyAvailableItems.some(
    (item) => item.type === 'resource' && item.id === 'helium-3',
  )

  return (
    <div className="cargo-pad-editor">
      <div className="cargo-pad-editor__controls">
        <div className="cargo-pad-editor__action-row">
          <span className="cargo-pad-editor__inter-system-group">
            <button
              className="cargo-pad-editor__inter-system"
              data-fuelled={isInterSystem && hasActualHelium3}
              type="button"
              aria-pressed={isInterSystem}
              onClick={onToggleType}
            >
              Inter-System
            </button>
            <ContextHelp
              context="Inter-System cargo pads"
              text={contextHelpText.interSystem}
            />
          </span>

          <button
            type="button"
            onClick={onRemove}
            className="cargo-pad-editor__remove"
            aria-label={`Remove ${pad.label}`}
          >
            Remove
          </button>
        </div>

        <select
          aria-label="Destination outpost"
          value={destinationId}
          onChange={(event) =>
            onLinkedOutpostChange(event.target.value)
          }
        >
          <option value="">Unlinked</option>

          {availableDestinations.map((outpost) => (
            <option
              disabled={outpost.cargoPads.length === 0}
              key={outpost.id}
              value={outpost.id}
            >
              {outpost.name}
              {outpost.cargoPads.length === 0 ? ' — no cargo pads' : ''}
            </option>
          ))}
        </select>

        {linkedOutpostId && (
          <select
            aria-label="Destination cargo pad"
            value={destinationPadId}
            onChange={(event) =>
              onLinkedCargoPadChange(event.target.value)
            }
          >
            <option value="">
              Select cargo pad...
            </option>

            {availableDestinationPads.map((destinationPad) => (
              <option
                key={destinationPad.id}
                value={destinationPad.id}
              >
                {getDestinationPadLabel(
                  destinationOutpost!.id,
                  destinationPad.id,
                )}
              </option>
            ))}
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
