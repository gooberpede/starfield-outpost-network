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
  'matrix.action.xTech.add': 'Add {resource} as present',
  'matrix.tooltip.xTech.add':
    'Add {resource} as present. It can be extracted at any outpost if X-Tech Power Cores are available.',
  'matrix.tooltip.xTech.present':
    '{resource} has been explicitly recorded as present at this outpost.',
  'matrix.tooltip.producing.active': '{item} is being produced at this outpost.',
  'matrix.tooltip.producing.inactive': '{item} is not being produced at this outpost.',
  'matrix.tooltip.manufacturing.blocked':
    '{item} is not being produced at this outpost due to missing inputs.',
  'matrix.tooltip.input.available': '{item} is available at this outpost.',
  'matrix.tooltip.input.unavailable': '{item} is not available at this outpost.',
  'matrix.tooltip.export.active': '{item} is being exported to {destinations}.',
  'matrix.tooltip.export.inactive': '{item} is not being exported.',
  'matrix.tooltip.import.active': '{item} is being imported.',
  'search.input.label': 'Search for resources or products in your outposts.',
  'search.input.placeholder': 'Search resources or products',
  'search.input.description': 'Type an item name or abbreviation, then confirm the item to search.',
  'search.submit': 'Search for item',
  'search.autocomplete.resource': 'Resource',
  'search.autocomplete.product': 'Product',
  'search.results.title': 'Search Results',
  'search.results.found':
    '{searchItem} was found at {count} {count, plural, one {outpost} other {outposts}}.',
  'search.results.notFound': '{searchItem} was not found at any outpost.',
  'search.results.close': 'Close Search Results',
  'search.results.flag.present': 'Present',
  'search.results.flag.producing': 'Producing',
  'search.results.flag.missingInputs': 'Missing Inputs',
  'search.results.flag.importing': 'Importing',
  'search.results.flag.exporting': 'Exporting',
  'search.results.flag.plannedSupply': 'Planned Supply',
  'search.results.dragInstructions':
    'Move Search Results with the arrow keys. Hold Shift for larger steps.',
} satisfies MessageCatalogue
