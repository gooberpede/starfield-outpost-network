import assert from 'node:assert/strict'
import test from 'node:test'

import { createDefaultNetwork } from '../src/domain/defaults.ts'
import type { Outpost, OutpostNetwork } from '../src/domain/models.ts'
import type { ReferenceData } from '../src/domain/referenceData.ts'
import { activeProductionValidForBodyRule } from '../src/domain/validation/rules/activeProductionValidForBody.ts'
import { duplicateCollectionEntriesRule } from '../src/domain/validation/rules/duplicateCollectionEntries.ts'
import { manufacturingInputsUnavailableRule } from '../src/domain/validation/rules/manufacturingInputsUnavailable.ts'
import { organicFarmingInputsUnavailableRule } from '../src/domain/validation/rules/organicFarmingInputsUnavailable.ts'
import { plannedSupplyUnresolvedRule } from '../src/domain/validation/rules/plannedSupplyUnresolved.ts'
import { unspecifiedOrganicProductionSourceRule } from '../src/domain/validation/rules/unspecifiedOrganicProductionSource.ts'
import type { ValidationIssue } from '../src/domain/validation/types.ts'
import {
  getValidationIssuePresentation,
  sortValidationIssues,
} from '../src/ui/validationPresentation.ts'

const referenceData: ReferenceData = {
  systems: [{ id: 'system-1', name: 'Alpha' }],
  bodies: [{
    id: 'body-1', systemId: 'system-1', name: 'Test World', bodyType: 'planet',
    outpostAllowed: true, solarArrayPower: 6, windTurbinePower: 6,
    planetaryHabitationRank: 0,
  }],
  biomes: [
    { id: 'forest', name: 'Forest' },
    { id: 'mountain', name: 'Mountain' },
  ],
  bodyBiomes: [
    { id: 'body-forest', bodyId: 'body-1', biomeId: 'forest', biomeIndex: 0 },
    { id: 'body-mountain', bodyId: 'body-1', biomeId: 'mountain', biomeIndex: 1 },
  ],
  resources: [
    { id: 'iron', name: 'Iron', shortName: 'Fe', category: 'inorganic', rarity: 'common', parentId: null, sortOrder: null, plannedSupplyPlacement: 'family' },
    { id: 'aluminium', name: 'Aluminum', shortName: 'Al', category: 'inorganic', rarity: 'common', parentId: null, sortOrder: null, plannedSupplyPlacement: 'family' },
    { id: 'fiber', name: 'Fiber', shortName: 'Fb', category: 'organic', rarity: 'common', parentId: null, sortOrder: null, plannedSupplyPlacement: null },
    { id: 'water', name: 'Water', shortName: 'H2O', category: 'inorganic', rarity: 'common', parentId: null, sortOrder: null, plannedSupplyPlacement: 'special' },
    { id: 'x-tech', name: 'X-Tech', shortName: 'XT', category: 'inorganic', rarity: 'unique', parentId: null, sortOrder: null, plannedSupplyPlacement: 'special' },
  ],
  products: [{ id: 'frame', name: 'Adaptive Frame', shortName: 'AF', rarity: 'common' }],
  inorganicOccurrences: [{
    bodyId: 'body-1', resourceId: 'iron',
    location: { type: 'biome', bodyBiomeId: 'body-mountain' },
  }],
  species: [{ id: 'grazer', name: 'Grazing Beetle', type: 'fauna' }],
  planetSpecies: [{
    bodyId: 'body-1', speciesId: 'grazer', sourceClass: 'herbivore',
    domesticable: true, resourceId: 'fiber',
  }],
  organicOccurrences: [{ bodyBiomeId: 'body-mountain', speciesId: 'grazer' }],
  organicFarmingProfiles: [{
    sourceClass: 'herbivore', inputs: [{ resourceId: 'water', quantity: 1 }],
  }],
  bodyResources: [{ bodyId: 'body-1', resourceIds: ['iron', 'fiber', 'water'] }],
  productRecipes: [{
    productId: 'frame', ingredients: [{ item: { type: 'resource', id: 'iron' }, quantity: 1 }],
  }],
}

function makeOutpost(overrides: Partial<Outpost> = {}): Outpost {
  return {
    id: 'outpost-1', name: 'Frontier', systemId: 'system-1', bodyId: 'body-1',
    selectedBiomeIds: [], localResources: [], explicitResourcePresence: [], activeProduction: [], manufacturing: [],
    plannedSupply: [], cargoPads: [], ...overrides,
  }
}

function makeNetwork(outpost: Outpost): OutpostNetwork {
  return { ...createDefaultNetwork(), outposts: [outpost] }
}

test('active production diagnostics name routes, selected biomes, and reliable alternatives', () => {
  const inorganicOutpost = makeOutpost({
    selectedBiomeIds: ['body-forest'],
    activeProduction: [{ type: 'inorganic', resourceId: 'iron' }],
  })
  const inorganicIssue = activeProductionValidForBodyRule.validate(
    makeNetwork(inorganicOutpost), referenceData,
  )[0]
  assert.equal(
    getValidationIssuePresentation(
      inorganicIssue, [inorganicOutpost], referenceData,
    ).message,
    'Iron is marked as produced, but is not available for outpost extraction in Forest biome.',
  )
  assert.equal(
    getValidationIssuePresentation(inorganicIssue, [inorganicOutpost], referenceData).remediation,
    'Available for extraction in: Mountain',
  )

  const organicOutpost = makeOutpost({
    selectedBiomeIds: ['body-forest'],
    activeProduction: [{ type: 'organic', resourceId: 'fiber', speciesId: 'grazer' }],
  })
  const organicIssue = activeProductionValidForBodyRule.validate(
    makeNetwork(organicOutpost), referenceData,
  )[0]
  assert.equal(
    getValidationIssuePresentation(
      organicIssue, [organicOutpost], referenceData,
    ).message,
    'Fiber is marked as produced, but is not available for outpost harvesting in Forest biome.',
  )
  assert.equal(
    getValidationIssuePresentation(organicIssue, [organicOutpost], referenceData).remediation,
    'Available for harvesting in: Mountain',
  )

  const withoutAlternatives = {
    ...referenceData,
    inorganicOccurrences: [],
  }
  assert.equal(
    getValidationIssuePresentation(inorganicIssue, [inorganicOutpost], withoutAlternatives).remediation,
    null,
  )

  const staleBiomeIssue = activeProductionValidForBodyRule.validate(
    makeNetwork(makeOutpost({
      selectedBiomeIds: ['stale-biome-id'],
      activeProduction: [{ type: 'inorganic', resourceId: 'iron' }],
    })),
    referenceData,
  )[0]
  assert.match(getValidationIssuePresentation(
    staleBiomeIssue, [makeOutpost({ selectedBiomeIds: ['stale-biome-id'] })], referenceData,
  ).message, /stale-biome-id biome/)
})

test('manufacturing and organic farming diagnostics name both structured facts', () => {
  const manufacturingIssue = manufacturingInputsUnavailableRule.validate(
    makeNetwork(makeOutpost({ manufacturing: [{ productId: 'frame', quantity: 1 }] })),
    referenceData,
  )[0]
  assert.equal(
    getValidationIssuePresentation(
      manufacturingIssue, [makeOutpost()], referenceData,
    ).message,
    'Adaptive Frame requires Iron, but Iron is not available at this outpost.',
  )
  assert.equal(manufacturingIssue.productId, 'frame')
  assert.deepEqual(manufacturingIssue.cargoItem, { type: 'resource', id: 'iron' })

  const farmingIssue = organicFarmingInputsUnavailableRule.validate(
    makeNetwork(makeOutpost({
      selectedBiomeIds: ['body-mountain'],
      activeProduction: [{ type: 'organic', resourceId: 'fiber', speciesId: 'grazer' }],
    })),
    referenceData,
  )[0]
  assert.equal(
    getValidationIssuePresentation(
      farmingIssue, [makeOutpost({ selectedBiomeIds: ['body-mountain'] })], referenceData,
    ).message,
    'Grazing Beetle requires Water, but Water is not available at this outpost.',
  )
})

test('manufacturing diagnostic presentation localizes names from stable IDs', () => {
  const localizedReferenceData: ReferenceData = {
    ...referenceData,
    resources: [
      ...referenceData.resources,
      { id: 'aluminium', name: 'Aluminum', shortName: 'Al', category: 'inorganic', rarity: 'common', parentId: null, sortOrder: null, plannedSupplyPlacement: 'family' },
    ],
    products: [
      ...referenceData.products,
      { id: 'plate', name: 'Test Plate', shortName: 'TP', rarity: 'common' },
    ],
    productRecipes: [
      ...referenceData.productRecipes,
      { productId: 'plate', ingredients: [{ item: { type: 'resource', id: 'aluminium' }, quantity: 1 }] },
    ],
  }
  const outpost = makeOutpost({ manufacturing: [{ productId: 'plate', quantity: 1 }] })
  const issue = manufacturingInputsUnavailableRule.validate(
    makeNetwork(outpost), localizedReferenceData,
  )[0]

  assert.equal(issue.cargoItem?.id, 'aluminium')
  assert.equal(
    getValidationIssuePresentation(issue, [outpost], localizedReferenceData, 'en-US').message,
    'Test Plate requires Aluminum, but Aluminum is not available at this outpost.',
  )
  assert.equal(
    getValidationIssuePresentation(issue, [outpost], localizedReferenceData, 'en-GB').message,
    'Test Plate requires Aluminium, but Aluminium is not available at this outpost.',
  )
})

test('invalid skill diagnostics resolve Bethesda official-term names', () => {
  const issue: ValidationIssue = {
    ruleId: 'invalid-skill-level',
    category: 'structural',
    severity: 'error',
    messageKey: 'validation.invalidSkillLevel',
    skillId: 'outpostEngineering',
    parameters: { level: 5, minimum: 0, maximum: 4 },
  }
  assert.match(
    getValidationIssuePresentation(issue, [], null, 'ja-JP').message,
    /拠点エンジニアリング/,
  )
  assert.match(
    getValidationIssuePresentation(issue, [], null, 'en-US').message,
    /Outpost Engineering/,
  )
  assert.equal(issue.skillId, 'outpostEngineering')
})

test('X-Tech diagnostics resolve the official resource name by stable identity', () => {
  const issue: ValidationIssue = {
    ruleId: 'x-tech-capability-mismatch',
    category: 'operational',
    severity: 'warning',
    messageKey: 'validation.xTechCapabilityPresent',
    cargoItem: { type: 'resource', id: 'x-tech' },
  }
  assert.match(
    getValidationIssuePresentation(issue, [], referenceData, 'ja-JP').message,
    /^X-テックは/,
  )
  assert.match(
    getValidationIssuePresentation(issue, [], referenceData, 'en-US').message,
    /^X-Tech is/,
  )
})

test('duplicate diagnostics resolve names and retain raw-ID fallbacks', () => {
  const outpost = makeOutpost({
    localResources: ['iron', 'iron'],
    activeProduction: [
      { type: 'inorganic', resourceId: 'iron' },
      { type: 'inorganic', resourceId: 'iron' },
    ],
    selectedBiomeIds: ['body-forest', 'body-forest'],
    manufacturing: [{ productId: 'frame', quantity: 1 }, { productId: 'frame', quantity: 1 }],
    plannedSupply: [{ type: 'resource', id: 'water' }, { type: 'resource', id: 'water' }],
    cargoPads: [{
      id: 'pad-a', label: 'Legacy label', type: 'regular',
      outboundItems: [{ type: 'product', id: 'frame' }, { type: 'product', id: 'frame' }],
    }],
  })
  const messages = duplicateCollectionEntriesRule.validate(makeNetwork(outpost), referenceData)
    .map((issue) => getValidationIssuePresentation(issue, [outpost], referenceData).message)
  assert.deepEqual(messages, [
    "Iron appears more than once in this outpost's local resources.",
    "Iron appears more than once in this outpost's active production.",
    "Forest appears more than once in this outpost's biome selection.",
    "Adaptive Frame appears more than once in this outpost's manufacturing list.",
    "Water appears more than once in this outpost's Planned Supply.",
    "Adaptive Frame appears more than once in this Cargo Link's outbound items.",
  ])

  const fallbackIssue = duplicateCollectionEntriesRule.validate(
    makeNetwork(makeOutpost({ localResources: ['unknown-id', 'unknown-id'] })),
    referenceData,
  )[0]
  assert.equal(
    getValidationIssuePresentation(fallbackIssue, [outpost], referenceData).message,
    "unknown-id appears more than once in this outpost's local resources.",
  )
})

test('diagnostic presentation sorts stably and derives current pad ordinals', () => {
  const outpost = makeOutpost({
    cargoPads: [
      { id: 'pad-a', label: 'A', type: 'regular', outboundItems: [] },
      { id: 'pad-b', label: 'B', type: 'regular', outboundItems: [] },
    ],
  })
  const padIssue: ValidationIssue = {
    ruleId: 'test', category: 'structural', severity: 'warning',
    messageKey: 'validation.unresolvedCargoExport',
    outpostId: outpost.id, cargoPadId: 'pad-b',
  }
  assert.equal(
    getValidationIssuePresentation(padIssue, [outpost], referenceData).context,
    'Frontier · Cargo Link 2',
  )
  assert.equal(
    getValidationIssuePresentation(
      { ...padIssue, cargoPadId: 'missing-pad' }, [outpost], referenceData,
    ).context,
    'Frontier · missing-pad',
  )

  const sorted = sortValidationIssues([
    { ...padIssue, ruleId: 'warning one' },
    { ...padIssue, severity: 'info', ruleId: 'info' },
    { ...padIssue, severity: 'error', ruleId: 'error' },
    { ...padIssue, ruleId: 'warning two' },
  ])
  assert.deepEqual(sorted.map((issue) => issue.ruleId), [
    'error', 'warning one', 'warning two', 'info',
  ])
})

test('Planned Supply emits one alphabetical Info summary per affected outpost', () => {
  assert.deepEqual(
    plannedSupplyUnresolvedRule.validate(makeNetwork(makeOutpost()), referenceData),
    [],
  )

  const singularIssue = plannedSupplyUnresolvedRule.validate(
    makeNetwork(makeOutpost({ plannedSupply: [{ type: 'resource', id: 'water' }] })),
    referenceData,
  )[0]
  assert.equal(getValidationIssuePresentation(
    singularIssue, [makeOutpost()], referenceData,
  ).message, '1 item in Planned Supply: Water.')
  assert.equal(singularIssue.severity, 'info')
  assert.equal(singularIssue.category, 'supply')
  assert.equal(singularIssue.outpostId, 'outpost-1')
  assert.equal(singularIssue.messageKey, 'validation.plannedSupplyUnresolved')
  assert.deepEqual(singularIssue.cargoItems, [{ type: 'resource', id: 'water' }])

  const pluralIssue = plannedSupplyUnresolvedRule.validate(
    makeNetwork(makeOutpost({
      plannedSupply: [
        { type: 'resource', id: 'water' },
        { type: 'resource', id: 'iron' },
        { type: 'product', id: 'frame' },
      ],
    })),
    referenceData,
  )[0]
  assert.equal(
    getValidationIssuePresentation(pluralIssue, [makeOutpost()], referenceData).message,
    '3 items in Planned Supply: Adaptive Frame, Iron, and Water.',
  )
})

test('Planned Supply presentation localizes stable item IDs and list grammar', () => {
  const outpost = makeOutpost({
    plannedSupply: [
      { type: 'resource', id: 'iron' },
      { type: 'resource', id: 'aluminium' },
    ],
  })
  const issue = plannedSupplyUnresolvedRule.validate(
    makeNetwork(outpost), referenceData,
  )[0]

  assert.deepEqual(issue.cargoItems, [
    { type: 'resource', id: 'aluminium' },
    { type: 'resource', id: 'iron' },
  ])

  const usMessage = getValidationIssuePresentation(
    issue, [outpost], referenceData, 'en-US',
  ).message
  assert.match(usMessage, /^2 items in Planned Supply:/)
  assert.match(usMessage, /Aluminum and Iron/)
  assert.doesNotMatch(usMessage, /Aluminium/)

  const gbMessage = getValidationIssuePresentation(
    issue, [outpost], referenceData, 'en-GB',
  ).message
  assert.match(gbMessage, /^2 items in Planned Supply:/)
  assert.match(gbMessage, /Aluminium and Iron/)

  const futureCanonicalReferenceData = {
    ...referenceData,
    resources: referenceData.resources.map((resource) =>
      resource.id === 'aluminium' ? { ...resource, name: 'Aluminum' } : resource),
  }
  assert.match(
    getValidationIssuePresentation(
      issue, [outpost], futureCanonicalReferenceData, 'en-GB',
    ).message,
    /Aluminium and Iron/,
  )

  const singular = plannedSupplyUnresolvedRule.validate(
    makeNetwork(makeOutpost({
      plannedSupply: [{ type: 'resource', id: 'aluminium' }],
    })),
    referenceData,
  )[0]
  assert.equal(
    getValidationIssuePresentation(singular, [outpost], referenceData, 'en-US').message,
    '1 item in Planned Supply: Aluminum.',
  )

  const unknownIssue = plannedSupplyUnresolvedRule.validate(
    makeNetwork(makeOutpost({
      plannedSupply: [{ type: 'resource', id: 'unknown-id' }],
    })),
  )[0]
  assert.equal(
    getValidationIssuePresentation(unknownIssue, [outpost], null, 'en-US').message,
    '1 item in Planned Supply: unknown-id.',
  )
})

test('unspecified organic production names the resource and valid sources', () => {
  const organicOutpost = makeOutpost({
    selectedBiomeIds: ['body-mountain'],
    activeProduction: [{ type: 'organic-unspecified', resourceId: 'fiber' }],
  })
  const expandedReferenceData: ReferenceData = {
    ...referenceData,
    species: [
      ...referenceData.species,
      { id: 'crawler', name: 'Armoured Crawler', type: 'fauna' },
    ],
    planetSpecies: [
      ...referenceData.planetSpecies,
      {
        bodyId: 'body-1', speciesId: 'crawler', sourceClass: 'herbivore',
        domesticable: true, resourceId: 'fiber',
      },
    ],
    organicOccurrences: [
      ...referenceData.organicOccurrences,
      { bodyBiomeId: 'body-mountain', speciesId: 'crawler' },
    ],
  }
  const issue = unspecifiedOrganicProductionSourceRule.validate(
    makeNetwork(organicOutpost),
    expandedReferenceData,
  )[0]
  assert.equal(
    getValidationIssuePresentation(issue, [organicOutpost], expandedReferenceData).message,
    'Fiber is recorded as produced, but no flora or fauna source has been specified.',
  )
  assert.equal(issue.severity, 'warning')
  assert.equal(issue.category, 'operational')
  assert.equal(
    getValidationIssuePresentation(issue, [organicOutpost], expandedReferenceData).remediation,
    'Available from: Armoured Crawler and Grazing Beetle',
  )

  const unavailableOutpost = { ...organicOutpost, selectedBiomeIds: ['body-forest'] }
  assert.equal(
    getValidationIssuePresentation(issue, [unavailableOutpost], expandedReferenceData).remediation,
    null,
  )
})
