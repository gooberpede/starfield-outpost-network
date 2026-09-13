import assert from 'node:assert/strict'
import test from 'node:test'

import type { ReferenceData } from '../src/domain/referenceData.ts'
import { translate } from '../src/localization/catalog.ts'
import { contextHelpText } from '../src/ui/contextHelpText.ts'
import { getContextHelpPosition } from '../src/ui/contextHelpPosition.ts'
import {
  getExportTooltip,
  getExplicitResourceAddTooltip,
  getExplicitResourcePresentTooltip,
  getImportTooltip,
  getInorganicPresentTooltip,
  getInputTooltip,
  getManufacturingProducingTooltip,
  getOrganicPresentTooltip,
  getPowerEfficiencyTooltip,
  getProducingTooltip,
} from '../src/ui/statusTooltips.ts'

const referenceData: ReferenceData = {
  systems: [],
  bodies: [{
    id: 'body', systemId: 'system', name: 'World', bodyType: 'planet',
    outpostAllowed: true, solarArrayPower: 6, windTurbinePower: 6,
    planetaryHabitationRank: 0,
  }],
  biomes: [
    { id: 'wetlands', name: 'Wetlands' },
    { id: 'forest', name: 'Forest' },
  ],
  bodyBiomes: [
    { id: 'body-wetlands', bodyId: 'body', biomeId: 'wetlands', biomeIndex: 0 },
    { id: 'body-forest', bodyId: 'body', biomeId: 'forest', biomeIndex: 1 },
  ],
  inorganicOccurrences: [],
  species: [{ id: 'grazer', name: 'Grazing Beetle', type: 'fauna' }],
  planetSpecies: [{
    bodyId: 'body', speciesId: 'grazer', sourceClass: 'herbivore',
    domesticable: true, resourceId: 'lubricant',
  }],
  organicOccurrences: [
    { bodyBiomeId: 'body-wetlands', speciesId: 'grazer' },
    { bodyBiomeId: 'body-forest', speciesId: 'grazer' },
  ],
  organicFarmingProfiles: [],
  resources: [{
    id: 'lubricant', name: 'Lubricant', shortName: 'Lub', category: 'organic',
    rarity: 'common', parentId: null, sortOrder: null, plannedSupplyPlacement: null,
  }],
  products: [], bodyResources: [], productRecipes: [],
}

const organicRoute = {
  type: 'organic' as const,
  resourceId: 'lubricant',
  speciesId: 'grazer',
}

test('the seven contextual-help strings retain their approved copy', () => {
  assert.deepEqual(Object.fromEntries(Object.entries(contextHelpText).map(
    ([name, key]) => [name, translate('en-US', key)],
  )), {
    plannedSupply: 'Selected items act as placeholders until local or imported supply is established.',
    logistics: 'Items currently assigned to cargo links are displayed here.',
    biomes: 'Selected biomes limit resource availability to resources that can occur in those biomes.',
    present: 'Shows whether a resource can be present at this outpost.',
    producing: 'Shows whether this outpost is currently set to produce the resource or product.',
    interSystem: 'Inter-System Cargo Links can connect outposts in different star systems and require Helium-3.',
    validation: 'Errors identify invalid states, warnings identify incomplete or inconsistent states, and info highlights useful follow-up items.',
  })
})

test('context help positions below when possible and flips above near the viewport edge', () => {
  assert.deepEqual(
    getContextHelpPosition(
      { left: 20, right: 30, top: 20, bottom: 30 },
      { width: 100, height: 40 },
      { width: 300, height: 200 },
    ),
    { left: 20, top: 36 },
  )
  assert.deepEqual(
    getContextHelpPosition(
      { left: 280, right: 290, top: 170, bottom: 180 },
      { width: 100, height: 40 },
      { width: 300, height: 200 },
    ),
    { left: 192, top: 124 },
  )
})

test('Present tooltips distinguish inorganic recorded and potential state', () => {
  assert.equal(
    getInorganicPresentTooltip('Aluminium', false, true),
    'Aluminium may be present at this outpost.',
  )
  assert.equal(
    getInorganicPresentTooltip('Aluminium', true, true),
    'Aluminium is recorded as present at this outpost.',
  )
})

test('X-Tech add and explicit Present tooltips use localized messages', () => {
  assert.equal(
    translate('en-GB', 'matrix.action.xTech.add', { resource: 'X-Tech' }),
    'Add X-Tech as present',
  )
  assert.equal(
    getExplicitResourceAddTooltip('X-Tech', 'en-US'),
    'Add X-Tech as present. It can be extracted at any outpost if X-Tech Power Cores are available.',
  )
  assert.equal(
    getExplicitResourcePresentTooltip('X-Tech', 'en-GB'),
    'X-Tech has been explicitly recorded as present at this outpost.',
  )
})

test('organic Present tooltips use planet, named-biome, and plural-biome wording', () => {
  assert.equal(
    getOrganicPresentTooltip('Lubricant', organicRoute, true, referenceData, 'body', []),
    'Lubricant is available from a domesticable species on this planet.',
  )
  assert.equal(
    getOrganicPresentTooltip(
      'Lubricant', organicRoute, true, referenceData, 'body', ['body-wetlands'],
    ),
    'Lubricant is available from a domesticable species in Wetlands.',
  )
  assert.equal(
    getOrganicPresentTooltip(
      'Lubricant', organicRoute, true, referenceData, 'body',
      ['body-wetlands', 'body-forest'],
    ),
    'Lubricant is available from a domesticable species in the selected biomes.',
  )
  assert.equal(
    getOrganicPresentTooltip(
      'Lubricant', organicRoute, false, referenceData, 'body', ['body-wetlands'],
    ),
    'Lubricant is not available from this domesticable species in the selected biome.',
  )
})

test('Solar and Wind tooltips expose canonical multiplier detail', () => {
  assert.equal(
    getPowerEfficiencyTooltip('Solar', 'poor', 4),
    'Solar: Poor · 0.67× output (−33%)',
  )
  assert.equal(
    getPowerEfficiencyTooltip('Wind', 'good', 10),
    'Wind: Good · 1.67× output (+67%)',
  )
  assert.equal(
    getPowerEfficiencyTooltip('Solar', 'normal', 6),
    'Solar: Normal · 1.00× output (no modifier)',
  )
})

test('Producing tooltips describe resource and manufacturing readiness state', () => {
  assert.equal(
    getProducingTooltip('Iron', true, 'en-US'),
    'Iron is being produced at this outpost.',
  )
  assert.equal(
    getProducingTooltip('Iron', false, 'en-US'),
    'Iron is not being produced at this outpost.',
  )
  assert.equal(
    getManufacturingProducingTooltip('Adaptive Frame', 'producing', 'en-US'),
    'Adaptive Frame is being produced at this outpost.',
  )
  assert.equal(
    getManufacturingProducingTooltip('Adaptive Frame', 'not-producing', 'en-US'),
    'Adaptive Frame is not being produced at this outpost due to missing inputs.',
  )
})

test('Inputs tooltips describe available and unavailable state', () => {
  assert.equal(
    getInputTooltip('Iron', true, 'en-US'),
    'Iron is available at this outpost.',
  )
  assert.equal(
    getInputTooltip('Iron', false, 'en-US'),
    'Iron is not available at this outpost.',
  )
})

test('Logistics tooltips use localized one, two, and three-destination lists', () => {
  assert.equal(getExportTooltip('Iron', [], 'en-US'), 'Iron is not being exported.')
  assert.equal(
    getExportTooltip('Iron', ['Feynman I'], 'en-US'),
    'Iron is being exported to Feynman I.',
  )
  assert.equal(
    getExportTooltip('Iron', ['Feynman I', 'Feynman V'], 'en-US'),
    'Iron is being exported to Feynman I and Feynman V.',
  )
  assert.equal(
    getExportTooltip('Iron', ['Feynman I', 'Feynman V', 'Arch III'], 'en-US'),
    'Iron is being exported to Feynman I, Feynman V, and Arch III.',
  )
})

test('Imports tooltip identifies only the imported item state', () => {
  const tooltip = getImportTooltip('Iron', 'en-US')
  assert.equal(tooltip, 'Iron is being imported.')
  assert.doesNotMatch(tooltip, /Source Outpost/)
})
