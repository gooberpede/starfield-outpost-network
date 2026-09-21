import assert from 'node:assert/strict'
import test from 'node:test'

import type { ReferenceData } from '../src/domain/referenceData.ts'
import {
  buildItemSearchCatalogue,
  foldLocalizedItemSearchText,
  getItemSearchMatches,
  getUniquelyResolvedSearchItem,
  normalizeItemSearchText,
} from '../src/ui/itemSearch.ts'

const references: ReferenceData = {
  systems: [], bodies: [], biomes: [], bodyBiomes: [], inorganicOccurrences: [],
  species: [], planetSpecies: [], organicOccurrences: [], organicFarmingProfiles: [],
  bodyResources: [], productRecipes: [],
  resources: [
    { id: 'aluminium', name: 'Aluminum', shortName: 'Al', category: 'inorganic', rarity: 'common', parentId: null, sortOrder: null, plannedSupplyPlacement: 'family' },
    { id: 'iron', name: 'Iron', shortName: 'Fe', category: 'inorganic', rarity: 'common', parentId: null, sortOrder: null, plannedSupplyPlacement: 'family' },
    { id: 'carboxylic-acids', name: 'Carboxylic Acids', shortName: 'R-COOH', category: 'inorganic', rarity: 'rare', parentId: null, sortOrder: null, plannedSupplyPlacement: 'family' },
    { id: 'wire-resource', name: 'Wire Fibre', shortName: 'WF', category: 'organic', rarity: 'common', parentId: null, sortOrder: null, plannedSupplyPlacement: null },
    { id: 'x-tech', name: 'X-Tech', shortName: 'XT', category: 'inorganic', rarity: 'unique', parentId: null, sortOrder: 3, plannedSupplyPlacement: 'special' },
    { id: 'aqueous-hematite', name: 'Aqueous Hematite', shortName: 'HnCn', category: 'inorganic', rarity: 'unique', parentId: null, sortOrder: null, plannedSupplyPlacement: 'family' },
    { id: 'helium-3', name: 'Helium-3', shortName: 'He-3', category: 'inorganic', rarity: 'common', parentId: null, sortOrder: null, plannedSupplyPlacement: 'family' },
    { id: 'ionic-liquids', name: 'Ionic Liquids', shortName: 'IL', category: 'inorganic', rarity: 'exotic', parentId: null, sortOrder: null, plannedSupplyPlacement: 'family' },
    { id: 'copper', name: 'Copper', shortName: 'Cu', category: 'inorganic', rarity: 'common', parentId: null, sortOrder: null, plannedSupplyPlacement: 'family' },
    { id: 'lead', name: 'Lead', shortName: 'Pb', category: 'inorganic', rarity: 'common', parentId: null, sortOrder: null, plannedSupplyPlacement: 'family' },
  ],
  products: [
    { id: 'zero-wire', name: 'Zero Wire', shortName: 'ZW', rarity: 'common' },
    { id: 'adaptive-frame', name: 'Adaptive Frame', shortName: 'AF', rarity: 'common' },
  ],
}

test('matching uses the required tiers, normalization, and stable identities', () => {
  const catalogue = buildItemSearchCatalogue(references, 'en-US')
  assert.deepEqual(getItemSearchMatches(catalogue, '  ZERO WIRE  ', 'en-US')
    .map(({ key }) => key), ['product:zero-wire'])
  assert.deepEqual(getItemSearchMatches(catalogue, 'zw', 'en-US')
    .map(({ key }) => key), ['product:zero-wire'])
  assert.deepEqual(getItemSearchMatches(catalogue, 'zero w', 'en-US')
    .map(({ key }) => key), ['product:zero-wire'])
  assert.deepEqual(getItemSearchMatches(catalogue, 'w', 'en-US')
    .map(({ key }) => key), ['resource:wire-resource', 'product:zero-wire'])
  assert.deepEqual(getItemSearchMatches(catalogue, 'dapt', 'en-US')
    .map(({ key }) => key), ['product:adaptive-frame'])
  assert.deepEqual(getItemSearchMatches(catalogue, '   ', 'en-US'), [])
  assert.deepEqual(getItemSearchMatches(catalogue, 'missing', 'en-US'), [])
  assert.deepEqual(getUniquelyResolvedSearchItem(
    getItemSearchMatches(catalogue, 'zero w', 'en-US'),
  ), { type: 'product', id: 'zero-wire' })
  assert.equal(getItemSearchMatches(catalogue, 'X-Tech', 'en-US')[0].item.id, 'x-tech')
  assert.equal(getItemSearchMatches(catalogue, 'XT', 'en-US')[0].item.id, 'x-tech')
})

test('localized names rebuild between US and UK English without changing identity', () => {
  const us = buildItemSearchCatalogue(references, 'en-US')
  const gb = buildItemSearchCatalogue(references, 'en-GB')
  assert.equal(us.find(({ key }) => key === 'resource:aluminium')?.displayName, 'Aluminum')
  assert.equal(gb.find(({ key }) => key === 'resource:aluminium')?.displayName, 'Aluminium')
  assert.equal(getItemSearchMatches(us, 'aluminum', 'en-US')[0].item.id, 'aluminium')
  assert.equal(getItemSearchMatches(gb, 'aluminium', 'en-GB')[0].item.id, 'aluminium')
  assert.equal(getItemSearchMatches(us, 'Al', 'en-US')[0].item.id, 'aluminium')
  assert.equal(getItemSearchMatches(us, 'R-COOH', 'en-US')[0].item.id, 'carboxylic-acids')
  assert.deepEqual(getItemSearchMatches(us, 'R-COC', 'en-US'), [])
})

test('Japanese display and matching preserve the submitted stable identity', () => {
  const catalogue = buildItemSearchCatalogue(references, 'ja-JP')
  const resource = catalogue.find(({ key }) => key === 'resource:aluminium')
  const product = catalogue.find(({ key }) => key === 'product:adaptive-frame')
  assert.equal(resource?.displayName, 'アルミニウム')
  assert.equal(product?.displayName, '順応型フレーム')
  assert.deepEqual(getUniquelyResolvedSearchItem(
    getItemSearchMatches(catalogue, 'アルミニウム', 'ja-JP'),
  ), { type: 'resource', id: 'aluminium' })
  assert.deepEqual(getUniquelyResolvedSearchItem(
    getItemSearchMatches(catalogue, '順応型フレーム', 'ja-JP'),
  ), { type: 'product', id: 'adaptive-frame' })
  for (const query of ['アルミ', 'Aluminum', 'Aluminium', 'AL', 'al']) {
    const matches = getItemSearchMatches(catalogue, query, 'ja-JP')
    assert.deepEqual(matches.map(({ key }) => key), ['resource:aluminium'], query)
    assert.equal(matches[0].displayName, 'アルミニウム', query)
  }
  assert.deepEqual(getUniquelyResolvedSearchItem(
    getItemSearchMatches(catalogue, 'adaptive frame', 'ja-JP'),
  ), { type: 'product', id: 'adaptive-frame' })
  assert.equal(getItemSearchMatches(catalogue, 'adaptive', 'ja-JP')[0].displayName, '順応型フレーム')
  assert.equal(getItemSearchMatches(catalogue, 'Aluminum', 'ja-JP').length, 1)
})

test('French and German search fold diacritics only as localized fallback aliases', () => {
  const french = buildItemSearchCatalogue(references, 'fr-FR')
  assert.equal(getItemSearchMatches(french, 'Hématite aqueuse', 'fr-FR')[0].item.id, 'aqueous-hematite')
  assert.equal(getItemSearchMatches(french, 'hematite aqueuse', 'fr-FR')[0].item.id, 'aqueous-hematite')
  assert.equal(getItemSearchMatches(french, 'helium 3', 'fr-FR')[0].item.id, 'helium-3')
  assert.equal(getItemSearchMatches(french, 'Aluminum', 'fr-FR')[0].displayName, 'Aluminium')

  const german = buildItemSearchCatalogue(references, 'de-DE')
  assert.equal(getItemSearchMatches(german, 'wassriger hamatit', 'de-DE')[0].item.id, 'aqueous-hematite')
  assert.equal(getItemSearchMatches(german, 'flussigkeiten', 'de-DE')[0].item.id, 'ionic-liquids')

  for (const [accented, plain] of [
    ['é', 'e'], ['è', 'e'], ['ê', 'e'], ['ë', 'e'], ['à', 'a'], ['â', 'a'],
    ['ç', 'c'], ['î', 'i'], ['ï', 'i'], ['ô', 'o'], ['ù', 'u'], ['û', 'u'],
    ['ü', 'u'], ['ÿ', 'y'], ['ä', 'a'], ['ö', 'o'],
  ] as const) {
    assert.equal(foldLocalizedItemSearchText(accented, 'fr-FR'), plain)
  }
  assert.equal(foldLocalizedItemSearchText('œ', 'fr-FR'), 'œ')
  assert.equal(foldLocalizedItemSearchText('ß', 'de-DE'), 'ß')
})

test('Spanish, Italian, and Brazilian Portuguese use narrow search-only folding', () => {
  const spanish = buildItemSearchCatalogue(references, 'es-ES')
  const italian = buildItemSearchCatalogue(references, 'it-IT')
  const portuguese = buildItemSearchCatalogue(references, 'pt-BR')

  for (const [catalogue, locale, localized, folded, id, english] of [
    [spanish, 'es-ES', 'Líquidos iónicos', 'liquidos ionicos', 'ionic-liquids', 'Ionic Liquids'],
    [italian, 'it-IT', 'Ematite acquosa', 'ematite acquosa', 'aqueous-hematite', 'Aqueous Hematite'],
    [portuguese, 'pt-BR', 'Líquidos Iônicos', 'liquidos ionicos', 'ionic-liquids', 'Ionic Liquids'],
  ] as const) {
    const exact = getItemSearchMatches(catalogue, localized, locale)
    const normalized = getItemSearchMatches(catalogue, folded, locale)
    const canonical = getItemSearchMatches(catalogue, english, locale)
    assert.deepEqual(exact.map(({ item }) => item.id), [id])
    assert.deepEqual(normalized.map(({ item }) => item.id), [id])
    assert.deepEqual(canonical.map(({ item }) => item.id), [id])
    assert.equal(exact[0].displayName, localized)
    assert.equal(normalized[0].displayName, localized)
    assert.equal(canonical[0].displayName, localized)
  }

  assert.equal(foldLocalizedItemSearchText('Telaraña', 'es-ES'), 'telarana')
  assert.equal(foldLocalizedItemSearchText('Telarana', 'es-ES'), 'telarana')
  assert.equal(foldLocalizedItemSearchText('L’Astraea', 'it-IT'), "l'astraea")
  assert.equal(foldLocalizedItemSearchText("L'Astraea", 'it-IT'), "l'astraea")
  assert.equal(foldLocalizedItemSearchText('Césio, Ímã', 'pt-BR'), 'cesio, ima')
  assert.equal(foldLocalizedItemSearchText('R-COOH', 'pt-BR'), 'r-cooh')
})

test('exact localized spelling outranks folded localized fallback matches', () => {
  const collisionReferences: ReferenceData = {
    ...references,
    resources: [
      ...references.resources,
      { ...references.resources[0], id: 'plain-spanish', name: 'Liquidos ionicos', shortName: 'PLI' },
    ],
  }
  const catalogue = buildItemSearchCatalogue(collisionReferences, 'es-ES')
  assert.deepEqual(
    getItemSearchMatches(catalogue, 'Líquidos iónicos', 'es-ES').map(({ item }) => item.id),
    ['ionic-liquids'],
  )
  assert.deepEqual(
    getItemSearchMatches(catalogue, 'liquidos ionicos', 'es-ES').map(({ item }) => item.id),
    ['plain-spanish', 'ionic-liquids'],
  )
})

test('Polish search folds diacritics and ł only as lower-ranked search aliases', () => {
  const catalogue = buildItemSearchCatalogue(references, 'pl-PL')
  for (const [localized, folded, id, english] of [
    ['Żelazo', 'zelazo', 'iron', 'Iron'],
    ['Miedź', 'miedz', 'copper', 'Copper'],
    ['Ołów', 'olow', 'lead', 'Lead'],
  ] as const) {
    for (const query of [localized, folded, english]) {
      const matches = getItemSearchMatches(catalogue, query, 'pl-PL')
      assert.deepEqual(matches.map(({ item }) => item.id), [id], query)
      assert.equal(matches[0].displayName, localized, query)
    }
  }

  assert.equal(foldLocalizedItemSearchText('ĄĆĘŁŃÓŚŹŻ', 'pl-PL'), 'acelnoszz')
  assert.equal(foldLocalizedItemSearchText("Ołów-Ruda'X", 'pl-PL'), "olow-ruda'x")
  assert.equal(new Set(getItemSearchMatches(catalogue, 'Iron', 'pl-PL').map(({ key }) => key)).size, 1)
})

test('exact Polish spelling outranks a future folded collision deterministically', () => {
  const base = buildItemSearchCatalogue(references, 'pl-PL').find(({ item }) => item.id === 'iron')!
  const plain = {
    ...base,
    item: { type: 'resource' as const, id: 'plain-zelazo' },
    key: 'resource:plain-zelazo',
    displayName: 'Zelazo',
    normalizedName: normalizeItemSearchText('Zelazo', 'pl-PL'),
    foldedNormalizedName: foldLocalizedItemSearchText('Zelazo', 'pl-PL'),
    normalizedAbbreviation: 'plain-zelazo',
    aliases: [],
  }
  assert.deepEqual(
    getItemSearchMatches([base, plain], 'Żelazo', 'pl-PL').map(({ item }) => item.id),
    ['iron'],
  )
  assert.deepEqual(
    getItemSearchMatches([base, plain], 'Zelazo', 'pl-PL').map(({ item }) => item.id),
    ['plain-zelazo', 'iron'],
  )
})

test('Spanish ñ and Italian curly apostrophes retain exact priority over search aliases', () => {
  const base = buildItemSearchCatalogue(references, 'en-US')[0]
  const entry = (displayName: string, id: string, locale: 'es-ES' | 'it-IT') => ({
    ...base,
    item: { type: 'resource' as const, id },
    key: `resource:${id}`,
    displayName,
    normalizedName: normalizeItemSearchText(displayName, locale),
    foldedNormalizedName: foldLocalizedItemSearchText(displayName, locale),
    normalizedAbbreviation: `unmatched-${id}`,
    aliases: [],
  })

  const spanish = [
    entry('Telaraña', 'enye', 'es-ES'),
    entry('Telarana', 'plain-n', 'es-ES'),
  ]
  assert.deepEqual(
    getItemSearchMatches(spanish, 'Telaraña', 'es-ES').map(({ item }) => item.id),
    ['enye'],
  )
  assert.deepEqual(
    getItemSearchMatches(spanish, 'Telarana', 'es-ES').map(({ item }) => item.id),
    ['plain-n', 'enye'],
  )

  const italian = [entry('L’Astraea', 'curly-apostrophe', 'it-IT')]
  for (const query of ['L’Astraea', "L'Astraea"]) {
    assert.deepEqual(
      getItemSearchMatches(italian, query, 'it-IT').map(({ item }) => item.id),
      ['curly-apostrophe'],
    )
    assert.equal(getItemSearchMatches(italian, query, 'it-IT')[0].displayName, 'L’Astraea')
  }
})

test('localized matches outrank canonical and alternate aliases', () => {
  const collisionReferences: ReferenceData = {
    ...references,
    resources: [
      references.resources[0],
      { ...references.resources[1], id: 'localized-aluminum', name: 'Aluminum' },
    ],
  }
  const catalogue = buildItemSearchCatalogue(collisionReferences, 'en-GB')
  assert.deepEqual(getItemSearchMatches(catalogue, 'Aluminum', 'en-GB').map(({ key }) => key), [
    'resource:localized-aluminum',
    'resource:aluminium',
  ])
})

test('ordering and collision disambiguation remain deterministic', () => {
  const collisionReferences: ReferenceData = {
    ...references,
    resources: [
      { ...references.resources[0], id: 'same-b', name: 'Same', shortName: 'S' },
      { ...references.resources[0], id: 'same-a', name: 'Same', shortName: 'SA' },
    ],
    products: [{ ...references.products[0], id: 'same-product', name: 'Same', shortName: 'SP' }],
  }
  const catalogue = buildItemSearchCatalogue(collisionReferences, 'en-US')
  const matches = getItemSearchMatches(catalogue, 'same', 'en-US')
  assert.deepEqual(matches.map(({ key }) => key), [
    'resource:same-a', 'resource:same-b', 'product:same-product',
  ])
  assert.equal(matches.every(({ needsCategoryDisambiguator }) => needsCategoryDisambiguator), true)
})

test('canonical alias collisions keep one deterministic row per stable entity', () => {
  const collisionReferences: ReferenceData = {
    ...references,
    resources: [
      { ...references.resources[0], id: 'shared-b', name: 'Shared Alias', shortName: 'SB' },
      { ...references.resources[0], id: 'shared-a', name: 'Shared Alias', shortName: 'SA' },
    ],
    products: [],
  }
  const catalogue = buildItemSearchCatalogue(collisionReferences, 'ja-JP')
  const matches = getItemSearchMatches(catalogue, 'shared alias', 'ja-JP')
  assert.deepEqual(matches.map(({ key }) => key), [
    'resource:shared-a',
    'resource:shared-b',
  ])
  assert.equal(new Set(matches.map(({ key }) => key)).size, 2)
  assert.equal(matches.every(({ needsCategoryDisambiguator }) => needsCategoryDisambiguator), true)
  assert.equal(getUniquelyResolvedSearchItem(matches), null)
})
