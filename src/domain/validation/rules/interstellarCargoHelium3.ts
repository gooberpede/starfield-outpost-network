/** Either eligible endpoint can supply an ordinary inter-system route in both
 * directions. Planned Supply counts here because validation tracks supply intent.
 */
import { getAvailableItemsAtOutpost } from '../../availability.ts'
import { resolveCargoFuel } from '../../cargoFuel.ts'
import type { ValidationRule } from '../types.ts'

export const interstellarCargoHelium3Rule: ValidationRule = {
  id: 'interstellar-cargo-helium-3',
  name: 'Interstellar cargo Helium-3',
  description: 'Flags paired inter-system links with no recorded or planned Helium-3 at either outpost.',
  category: 'operational',
  defaultSeverity: 'warning',
  validate(network, reference) {
    const fuel = resolveCargoFuel(network, reference, id => getAvailableItemsAtOutpost(id, network, reference))
    return fuel.links.filter(link => fuel.sourceAt(link.endpointA) === 'neither')
      .sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
      .map(link => ({
        ruleId: 'interstellar-cargo-helium-3',
        category: 'operational',
        severity: 'warning',
        messageKey: 'validation.interstellarHelium3',
        cargoLinkId: link.id,
        linkedOutpostIds: [link.endpointA.outpostId, link.endpointB.outpostId].sort(),
      }))
  },
}
