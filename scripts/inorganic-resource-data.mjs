/**
 * Purpose: Parse canonical inorganic resource truth and join tracker policy.
 * Architecture: FormID is the source identity; policy pins persisted app IDs
 *   and tracker-only visibility, rarity, and Planned Supply presentation.
 * Change this file when: canonical/policy contracts or their invariants change.
 */
import { parse } from 'csv-parse/sync'

export const CANONICAL_INORGANIC_HEADERS = [
  'SourceFile',
  'ExtractTimestamp',
  'ResourceFormID',
  'ResourceEditorID',
  'ResourceName',
  'ResourceShortName',
  'SNAMRarity',
  'ClassificationKeyword',
  'EffectiveParentSourceFile',
  'EffectiveParentFormID',
  'EffectiveParentEditorID',
  'EffectiveParentName',
]

export const INORGANIC_POLICY_HEADERS = [
  'ResourceFormID',
  'ResourceId',
  'Disposition',
  'TrackerRarity',
  'PlannedSupplyPlacement',
  'PlannedSupplyOrder',
]

export const LEGACY_INORGANIC_RESOURCE_IDS = new Set([
  'aldumite', 'alkanes', 'aluminium', 'antimony', 'argon', 'benzene',
  'beryllium', 'caesium', 'carboxylic-acids', 'chlorine', 'chlorosilanes',
  'cobalt', 'copper', 'dysprosium', 'europium', 'fluorine', 'gold',
  'helium-3', 'indicite', 'ionic-liquids', 'iridium', 'iron', 'lead',
  'lithium', 'mercury', 'neodymium', 'neon', 'nickel', 'palladium',
  'platinum', 'plutonium', 'rothicite', 'silver', 'tantalum', 'tasine',
  'tetrafluorides', 'titanium', 'tungsten', 'uranium', 'vanadium', 'veryl',
  'vytinium', 'water', 'xenon', 'ytterbium',
])

const CANONICAL_RARITIES = new Set([
  'Common', 'Uncommon', 'Rare', 'Exotic', 'Unique', 'Everywhere', 'Special',
])
const TRACKER_RARITIES = new Set(['common', 'uncommon', 'rare', 'exotic', 'unique'])
const DISPOSITIONS = new Set(['ordinary', 'special-enabled', 'special-deferred', 'excluded'])
const PLACEMENTS = new Set(['family', 'special', 'hidden'])
const CLASSIFICATION_KEYWORDS = new Set([
  'ResourceTypeCraftingInorganicCommon',
  'ResourceTypeCraftingInorganicUncommon',
  'ResourceTypeCraftingInorganicRare',
  'ResourceTypeCraftingInorganicExotic',
  'ResourceTypeCraftingInorganicUnique',
  'Y2_X-Tech_Resource_Keyword',
])

function parseCsvWithExactHeaders(csv, expectedHeaders, sourceName) {
  const rows = parse(csv, { bom: true, skip_empty_lines: true, trim: true })
  const headers = rows.shift() ?? []
  if (JSON.stringify(headers) !== JSON.stringify(expectedHeaders)) {
    throw new Error(`${sourceName} has unexpected headers: ${headers.join(',')}.`)
  }
  return rows.map((values, index) => {
    if (values.length !== expectedHeaders.length) {
      throw new Error(`${sourceName} row ${index + 2} has ${values.length} columns; expected ${expectedHeaders.length}.`)
    }
    return Object.fromEntries(expectedHeaders.map((header, column) => [header, values[column]]))
  })
}

function assertUnique(map, key, description, rowNumber) {
  if (map.has(key)) throw new Error(`Duplicate ${description} "${key}" at row ${rowNumber}.`)
  map.set(key, rowNumber)
}

function parseOptionalOrder(value, context) {
  if (value === '') return null
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) < 1) {
    throw new Error(`${context} has invalid PlannedSupplyOrder "${value}".`)
  }
  return Number(value)
}

export function parseCanonicalInorganicCsv(csv) {
  const rows = parseCsvWithExactHeaders(csv, CANONICAL_INORGANIC_HEADERS, 'Canonical inorganic dictionary')
  const formIds = new Map()
  const editorIds = new Map()
  const names = new Map()
  const shortNames = new Map()
  let extractTimestamp = null

  for (const [index, row] of rows.entries()) {
    const rowNumber = index + 2
    for (const field of [
      'SourceFile', 'ExtractTimestamp', 'ResourceFormID', 'ResourceEditorID',
      'ResourceName', 'ResourceShortName', 'SNAMRarity', 'ClassificationKeyword',
    ]) {
      if (!row[field]) throw new Error(`Canonical inorganic row ${rowNumber} is missing ${field}.`)
    }
    if (!/^[0-9A-F]{8}$/.test(row.ResourceFormID)) {
      throw new Error(`Canonical inorganic row ${rowNumber} has invalid ResourceFormID "${row.ResourceFormID}".`)
    }
    assertUnique(formIds, row.ResourceFormID, 'canonical ResourceFormID', rowNumber)
    assertUnique(editorIds, row.ResourceEditorID, 'canonical ResourceEditorID', rowNumber)
    assertUnique(names, row.ResourceName, 'canonical resource name', rowNumber)
    assertUnique(shortNames, row.ResourceShortName, 'canonical resource short name', rowNumber)
    if (!CANONICAL_RARITIES.has(row.SNAMRarity)) {
      throw new Error(`Canonical inorganic row ${rowNumber} has unrecognized SNAMRarity "${row.SNAMRarity}".`)
    }
    if (!CLASSIFICATION_KEYWORDS.has(row.ClassificationKeyword)) {
      throw new Error(`Canonical inorganic row ${rowNumber} has unrecognized ClassificationKeyword "${row.ClassificationKeyword}".`)
    }
    if (extractTimestamp === null) extractTimestamp = row.ExtractTimestamp
    if (row.ExtractTimestamp !== extractTimestamp) {
      throw new Error(`Canonical inorganic row ${rowNumber} has inconsistent ExtractTimestamp.`)
    }
    const parentFields = [
      row.EffectiveParentSourceFile, row.EffectiveParentFormID,
      row.EffectiveParentEditorID, row.EffectiveParentName,
    ]
    if (parentFields.some(Boolean) && !parentFields.every(Boolean)) {
      throw new Error(`Canonical inorganic row ${rowNumber} has incomplete effective-parent metadata.`)
    }
  }

  const byFormId = new Map(rows.map((row) => [row.ResourceFormID, row]))
  for (const [index, row] of rows.entries()) {
    if (!row.EffectiveParentFormID) continue
    const parent = byFormId.get(row.EffectiveParentFormID)
    if (!parent) throw new Error(`Canonical inorganic row ${index + 2} has unknown parent FormID ${row.EffectiveParentFormID}.`)
    if (parent === row) throw new Error(`Canonical inorganic resource ${row.ResourceName} cannot parent itself.`)
    if (parent.SourceFile !== row.EffectiveParentSourceFile ||
        parent.ResourceEditorID !== row.EffectiveParentEditorID ||
        parent.ResourceName !== row.EffectiveParentName) {
      throw new Error(`Canonical inorganic row ${index + 2} has contradictory parent metadata.`)
    }
  }

  const states = new Map()
  function visit(row) {
    if (states.get(row.ResourceFormID) === 'visiting') {
      throw new Error(`Canonical inorganic parent graph contains a cycle at ${row.ResourceFormID}.`)
    }
    if (states.get(row.ResourceFormID) === 'visited') return
    states.set(row.ResourceFormID, 'visiting')
    if (row.EffectiveParentFormID) visit(byFormId.get(row.EffectiveParentFormID))
    states.set(row.ResourceFormID, 'visited')
  }
  rows.forEach(visit)
  return rows
}

export function parseInorganicTrackerPolicyCsv(csv) {
  const rows = parseCsvWithExactHeaders(csv, INORGANIC_POLICY_HEADERS, 'Inorganic tracker policy')
  const formIds = new Map()
  const appIds = new Map()
  return rows.map((row, index) => {
    const rowNumber = index + 2
    for (const field of ['ResourceFormID', 'ResourceId', 'Disposition', 'TrackerRarity', 'PlannedSupplyPlacement']) {
      if (!row[field]) throw new Error(`Inorganic tracker policy row ${rowNumber} is missing ${field}.`)
    }
    if (!/^[0-9A-F]{8}$/.test(row.ResourceFormID)) throw new Error(`Inorganic tracker policy row ${rowNumber} has invalid ResourceFormID.`)
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.ResourceId)) throw new Error(`Inorganic tracker policy row ${rowNumber} has invalid ResourceId.`)
    if (!DISPOSITIONS.has(row.Disposition)) throw new Error(`Inorganic tracker policy row ${rowNumber} has invalid disposition "${row.Disposition}".`)
    if (!TRACKER_RARITIES.has(row.TrackerRarity)) throw new Error(`Inorganic tracker policy row ${rowNumber} has invalid tracker rarity "${row.TrackerRarity}".`)
    if (!PLACEMENTS.has(row.PlannedSupplyPlacement)) throw new Error(`Inorganic tracker policy row ${rowNumber} has invalid Planned Supply placement.`)
    assertUnique(formIds, row.ResourceFormID, 'policy ResourceFormID', rowNumber)
    assertUnique(appIds, row.ResourceId, 'policy ResourceId', rowNumber)
    return { ...row, plannedSupplyOrder: parseOptionalOrder(row.PlannedSupplyOrder, `Inorganic tracker policy row ${rowNumber}`) }
  })
}

export function buildInorganicResources(canonicalRows, policyRows) {
  const canonicalByFormId = new Map(canonicalRows.map((row) => [row.ResourceFormID, row]))
  const policyByFormId = new Map(policyRows.map((row) => [row.ResourceFormID, row]))
  if (canonicalByFormId.size !== policyByFormId.size ||
      canonicalRows.some((row) => !policyByFormId.has(row.ResourceFormID)) ||
      policyRows.some((row) => !canonicalByFormId.has(row.ResourceFormID))) {
    throw new Error('Canonical inorganic dictionary and tracker policy must have an exact one-to-one FormID mapping.')
  }

  const ordinaryPolicy = policyRows.filter((row) => row.Disposition === 'ordinary')
  const ordinaryIds = new Set(ordinaryPolicy.map((row) => row.ResourceId))
  if (ordinaryIds.size !== 45 || ordinaryIds.size !== LEGACY_INORGANIC_RESOURCE_IDS.size ||
      [...LEGACY_INORGANIC_RESOURCE_IDS].some((id) => !ordinaryIds.has(id))) {
    throw new Error('Tracker policy does not preserve the complete 45-resource legacy application-ID set.')
  }
  const enabledSpecialIds = policyRows.filter((row) => row.Disposition === 'special-enabled')
    .map((row) => row.ResourceId)
  if (JSON.stringify(enabledSpecialIds) !== JSON.stringify(['x-tech']) ||
      policyByFormId.get('00006529')?.Disposition !== 'excluded' ||
      policyByFormId.get('00252074')?.Disposition !== 'excluded') {
    throw new Error('Tracker policy must enable only x-tech and keep Aqueous Hematite and Caelumite excluded.')
  }

  const resourceByFormId = new Map()
  const resources = []
  for (const canonical of canonicalRows) {
    const policy = policyByFormId.get(canonical.ResourceFormID)
    if (policy.Disposition !== 'ordinary' && policy.Disposition !== 'special-enabled') {
      if (policy.PlannedSupplyPlacement !== 'hidden' || policy.plannedSupplyOrder !== null) {
        throw new Error(`Non-ordinary resource ${canonical.ResourceName} must use hidden placement without an order.`)
      }
      continue
    }
    if (policy.PlannedSupplyPlacement === 'hidden') throw new Error(`Runtime resource ${canonical.ResourceName} cannot use hidden placement.`)
    const resource = {
      id: policy.ResourceId,
      name: canonical.ResourceName,
      shortName: canonical.ResourceShortName,
      category: 'inorganic',
      rarity: policy.TrackerRarity,
      parentId: null,
      sortOrder: policy.plannedSupplyOrder,
      plannedSupplyPlacement: policy.PlannedSupplyPlacement,
    }
    resources.push(resource)
    resourceByFormId.set(canonical.ResourceFormID, { canonical, policy, resource })
  }

  for (const entry of resourceByFormId.values()) {
    const parentFormId = entry.canonical.EffectiveParentFormID
    if (!parentFormId) continue
    const parent = resourceByFormId.get(parentFormId)
    if (!parent) throw new Error(`Included resource ${entry.resource.id} has a non-included parent ${parentFormId}.`)
    entry.resource.parentId = parent.resource.id
  }

  const rarityOrder = ['common', 'uncommon', 'rare', 'exotic', 'unique']
  for (const { resource } of resourceByFormId.values()) {
    if (resource.parentId) {
      const parent = resources.find((candidate) => candidate.id === resource.parentId)
      if (rarityOrder.indexOf(parent.rarity) >= rarityOrder.indexOf(resource.rarity)) {
        throw new Error(`Included resource ${resource.id} must be rarer than parent ${parent.id}.`)
      }
    }
  }

  const ordersByScope = new Map()
  for (const resource of resources) {
    if (resource.sortOrder === null) continue
    const scope = resource.plannedSupplyPlacement === 'special' ? '__special__' : (resource.parentId ?? '__root__')
    const orders = ordersByScope.get(scope) ?? new Set()
    if (orders.has(resource.sortOrder)) throw new Error(`Planned Supply scope ${scope} reuses order ${resource.sortOrder}.`)
    orders.add(resource.sortOrder)
    ordersByScope.set(scope, orders)
  }

  const specialIds = resources.filter((resource) => resource.plannedSupplyPlacement === 'special')
    .sort((left, right) => left.sortOrder - right.sortOrder).map((resource) => resource.id)
  if (JSON.stringify(specialIds) !== JSON.stringify(['helium-3', 'water', 'x-tech'])) {
    throw new Error('The special strip must contain helium-3, water, and x-tech in that order.')
  }
  return { resources, resourceByFormId, policyByFormId }
}
