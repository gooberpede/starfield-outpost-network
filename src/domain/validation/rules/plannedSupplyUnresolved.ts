/**
 * Reports each outpost whose Planned Supply still contains virtual sources.
 * One summary issue keeps the diagnostic useful without multiplying every
 * planned item into its own validation row.
 */

import type {
  CargoItem,
} from '../../models'

import type {
  ReferenceData,
} from '../../referenceData'

import type {
  ValidationRule,
} from '../types'

const RULE_ID = 'planned-supply-unresolved'

function getCargoItemName(
  item: CargoItem,
  referenceData?: ReferenceData,
): string {
  const reference = item.type === 'resource'
    ? referenceData?.resources.find((entry) => entry.id === item.id)
    : referenceData?.products.find((entry) => entry.id === item.id)

  return reference?.name ?? item.id
}

export const plannedSupplyUnresolvedRule: ValidationRule = {
  id: RULE_ID,
  name: 'Unresolved Planned Supply',
  description: 'Reports outposts that still rely on Planned Supply.',
  category: 'supply',
  defaultSeverity: 'info',

  validate(network, referenceData) {
    return network.outposts.flatMap((outpost) => {
      if (outpost.plannedSupply.length === 0) return []

      const itemNames = outpost.plannedSupply
        .map((item) => getCargoItemName(item, referenceData))
        .sort((left, right) => left.localeCompare(right, 'en'))
      const itemCount = itemNames.length

      return [{
        ruleId: RULE_ID,
        category: 'supply',
        severity: 'info',
        message: itemCount === 1
          ? `1 item in Planned Supply: ${itemNames[0]}.`
          : `${itemCount} items in Planned Supply: ${itemNames.join(', ')}.`,
        outpostId: outpost.id,
      }]
    })
  },
}
