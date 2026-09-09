import type { MessageCatalogue } from '../types.ts'

/** Complete baseline catalogue. Every supported message must exist here. */
export const enUSMessages = {
  'locale.selector.label': 'Language and region',
  'locale.selector.automatic': 'Automatic ({locale})',
  'network.delete.button': 'Delete Network',
  'network.delete.confirmTitle': 'DELETE NETWORK',
  'network.delete.explanation': 'Remove the current network from this collection?',
  'network.delete.undoHint': 'You can undo this action during the current session.',
  'outpost.defaultName': 'New Outpost',
  'validation.issueCount': 'Validation: {count} {count, plural, one {issue} other {issues}}',
  'validation.manufacturingInputUnavailable':
    '{product} requires {input}, but {input} is not available at this outpost.',
  'validation.plannedSupplyUnresolved':
    '{count} {count, plural, one {item} other {items}} in Planned Supply: {itemList}.',
  'help.inorganicPresentRecorded': '{resource} is recorded as present at this outpost.',
  'help.inorganicPresentPossible': '{resource} may be present at this outpost.',
} satisfies MessageCatalogue
