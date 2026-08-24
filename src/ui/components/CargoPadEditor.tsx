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

import type {
  ItemProvenance,
} from '../../domain/provenance'

import { CargoExportsEditor } from './CargoExportsEditor'
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
  getItemProvenance: (
    item: CargoItem,
  ) => ItemProvenance
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
  getItemProvenance,
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

  /**
   * Treats regular cargo pads as the default state.
   *
   * The UI therefore exposes only the exceptional property — whether this
   * pad is interstellar — rather than requiring a two-option type selector.
   */
  function updateInterstellar() {
    onToggleType()
  }

  return (
    <div className="cargo-pad-editor">
      <div className="cargo-pad-editor__controls">
        <label>
          <input
            type="checkbox"
            checked={pad.type === 'interstellar'}
            onChange={() =>
              updateInterstellar()
            }
          />
          {' '}Interstellar
        </label>

        <label>
          Outpost:
          <select
            value={destinationId}
            onChange={(event) =>
              onLinkedOutpostChange(event.target.value)
            }
          >
            <option value="">Unlinked</option>

            {availableDestinations.map((outpost) => (
              <option
                key={outpost.id}
                value={outpost.id}
              >
                {outpost.name}
              </option>
            ))}
          </select>
        </label>

        {linkedOutpostId && (
          <label>
            Pad:
            <select
              value={destinationPadId}
              onChange={(event) =>
                onLinkedCargoPadChange(
                  event.target.value,
                )
              }
            >
              <option value="">
                Select cargo pad...
              </option>

              {availableDestinationPads.map(
                (destinationPad) => (
                  <option
                    key={destinationPad.id}
                    value={destinationPad.id}
                  >
                    {getDestinationPadLabel(
                      destinationOutpost!.id,
                      destinationPad.id,
                    )}
                  </option>
                ),
              )}
            </select>
          </label>
        )}

        <button
          type="button"
          onClick={onRemove}
          className="cargo-pad-editor__remove"
        >
          Remove Cargo Pad
        </button>
      </div>

      <CargoExportsEditor
        resources={resources}
        products={products}
        outposts={outposts}
        availableItems={availableItems}
        getItemProvenance={getItemProvenance}
        exports={pad.outboundItems}
        onToggleExport={onToggleExport}
      />
    </div>
  )
}