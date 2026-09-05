/**
 * Purpose: Validate canonical biome extracts and build lean runtime relations.
 * Architecture: Build-time only; curated resource IDs remain authoritative.
 *   Provenance stays in CSV/manifest files, never in runtime objects.
 * Change this file when: source schemas, identity invariants, or runtime grains change.
 */
import { readFile } from 'node:fs/promises'

const RESOURCE_NAME_ALIASES = new Map([
  ['Aluminum', 'Aluminium'],
  ['Gastro Delight', 'Gastronomic Delight'],
])

function requireValue(value, context) {
  if (typeof value !== 'string' || value === '') {
    throw new Error(`${context}: missing required value.`)
  }
  return value
}

function nonnegativeNumber(value, context, integer = false) {
  if (!/^(?:\d+)(?:\.\d+)?$/.test(value) || !Number.isFinite(Number(value)) ||
      (integer && !Number.isSafeInteger(Number(value)))) {
    throw new Error(`${context}: invalid numeric value "${value}".`)
  }
  return Number(value)
}

export function parseBodyNumber(row, field) {
  const value = row[field]
  if (value === '') return null
  const number = nonnegativeNumber(value, `Planet ${row.PlanetFormID} ${field}`, field === 'PlanetaryHabitationRank')
  if (field === 'PlanetaryHabitationRank' && number > 4) {
    throw new Error(`Planet ${row.PlanetFormID}: invalid ${field} "${value}"; expected 0–4.`)
  }
  return number
}

/** Only companion-output assertions are compatibility checks; upstream hashes are provenance. */
export async function validateInorganicManifest(path, rows) {
  let manifest
  try {
    manifest = JSON.parse(await readFile(path, 'utf8'))
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    console.info('INFO: no biome-inorganic-resources manifest found; skipping optional manifest validation.')
    return
  }
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    throw new Error('Inorganic manifest must be an object.')
  }
  const expected = {
    dataset: 'biome-inorganic-resources',
    schema_version: 1,
    output_filename: 'biome-inorganic-resources.csv',
    row_count: rows.length,
  }
  function reconcile(field, declared, actual) {
    if (declared !== undefined && declared !== actual) {
      throw new Error(`Inorganic manifest ${field}: expected ${JSON.stringify(declared)}, actual ${JSON.stringify(actual)}.`)
    }
  }
  for (const [field, actual] of Object.entries(expected)) {
    reconcile(field, manifest[field], actual)
  }
  for (const type of ['BIOME', 'ATMOSPHERE']) {
    reconcile(`location_row_counts.${type}`, manifest.location_row_counts?.[type], rows.filter((row) => row.LocationType === type).length)
  }
  console.info(`Inorganic manifest reconciled: ${JSON.stringify(expected)}; location counts checked where declared.`)
}

/** Repetition is natural at source grain; only conflicting semantic facts are errors. */
function agree(map, key, value, context) {
  const previous = map.get(key)
  if (previous !== undefined && JSON.stringify(previous) !== JSON.stringify(value)) {
    throw new Error(`${context}: conflicting identity/facts for ${key}: ${JSON.stringify(previous)} versus ${JSON.stringify(value)}.`)
  }
  map.set(key, value)
}

export function buildBiomeData(inorganicRows, organicRows, bodies, resources) {
  const bodiesById = new Map(bodies.map((body) => [body.id, body]))
  const resourcesByName = new Map(resources.map((resource) => [resource.name, resource]))
  const resourceCrosswalk = new Map()
  const biomes = new Map()
  const biomeEditorIds = new Map()
  const bodyBiomes = new Map()
  const indicesByBodyBiome = new Map()
  const species = new Map()
  const planetSpecies = new Map()
  const organicOccurrences = new Map()
  const inorganicOccurrences = new Map()
  const inorganicFacts = new Map()
  const organicFarmingProfiles = new Map()

  function resolveResource(formId, name, category, context) {
    requireValue(formId, `${context} resource FormID`)
    requireValue(name, `${context} resource name`)
    const resource = resourcesByName.get(RESOURCE_NAME_ALIASES.get(name) ?? name)
    if (!resource || resource.category !== category) {
      throw new Error(`${context}: cannot crosswalk ${formId} (${category}: ${name}).`)
    }
    agree(resourceCrosswalk, formId, resource.id, context)
    return resource
  }

  function joinBody(row, context) {
    const body = bodiesById.get(row.PlanetFormID)
    if (!body) throw new Error(`${context}: unresolved body ${row.PlanetFormID}.`)
    if (row.StarSystemID !== undefined && row.StarSystemID !== body.systemId) {
      throw new Error(`${context}: contradictory system ${row.StarSystemID}; expected ${body.systemId}.`)
    }
    return body.id
  }

  function joinBiome(row, bodyId, context) {
    const biomeId = requireValue(row.BiomeFormID, `${context} BiomeFormID`)
    const name = requireValue(row.BiomeName, `${context} BiomeName`)
    const biomeIndex = nonnegativeNumber(row.BiomeIndex, `${context} BiomeIndex`, true)
    const id = `${bodyId}:${biomeIndex}`
    agree(biomes, biomeId, { id: biomeId, name }, context)
    agree(biomeEditorIds, biomeId, requireValue(row.BiomeEditorID, `${context} BiomeEditorID`), context)
    agree(bodyBiomes, id, { id, bodyId, biomeId, biomeIndex }, context)
    agree(indicesByBodyBiome, `${bodyId}:${biomeId}`, biomeIndex, context)
    return id
  }

  for (const [index, row] of inorganicRows.entries()) {
    const context = `Inorganic row ${index + 2}, planet ${row.PlanetFormID}, resource ${row.ResourceFormID}`
    const bodyId = joinBody(row, context)
    if (!['BIOME', 'ATMOSPHERE'].includes(row.LocationType)) {
      throw new Error(`${context}: unsupported LocationType "${row.LocationType}".`)
    }
    if (row.ResourceCategory !== 'Inorganic') throw new Error(`${context}: invalid ResourceCategory.`)
    const resource = resolveResource(row.ResourceFormID, row.ResourceName, 'inorganic', context)
    const rarity = requireValue(row.Rarity, `${context} Rarity`).toLowerCase()
    // Source rarity labels (including Special/Everywhere) are audit metadata;
    // the curated dictionary owns the runtime rarity scale.
    const location = row.LocationType === 'BIOME'
      ? { type: 'biome', bodyBiomeId: joinBiome(row, bodyId, context) }
      : { type: 'atmosphere' }
    // Metadata is checked at canonical occurrence grain but is not duplicated at runtime.
    const key = `${bodyId}:${location.bodyBiomeId ?? 'atmosphere'}:${row.ResourceFormID}`
    agree(inorganicFacts, key, { resourceId: resource.id, editorId: row.ResourceEditorID, rarity }, context)
    const occurrence = { bodyId, resourceId: resource.id, location }
    inorganicOccurrences.set(JSON.stringify(occurrence), occurrence)
  }

  for (const [index, row] of organicRows.entries()) {
    const context = `Organic row ${index + 2}, planet ${row.PlanetFormID}, species ${row.SpeciesFormID}, resource ${row.ResourceFormID}`
    const bodyId = joinBody(row, context)
    const bodyBiomeId = joinBiome(row, bodyId, context)
    const speciesId = requireValue(row.SpeciesFormID, `${context} SpeciesFormID`)
    const name = requireValue(row.SpeciesDisplayName, `${context} SpeciesDisplayName`)
    if (!['Flora', 'Fauna'].includes(row.SpeciesType)) throw new Error(`${context}: invalid SpeciesType ${row.SpeciesType}.`)
    if (!['Yes', 'No'].includes(row.Domesticable)) throw new Error(`${context}: invalid Domesticable ${row.Domesticable}.`)
    const type = row.SpeciesType.toLowerCase()
    agree(species, speciesId, { id: speciesId, name, type }, context)

    let resourceId = null
    let sourceClass = null
    const inputs = []
    for (const slot of [1, 2]) {
      const prefix = `ResourceInput${slot}`
      if (![row[`${prefix}FormID`], row[`${prefix}Name`], row[`${prefix}Qty`]].some(Boolean)) continue
      const input = resolveResource(row[`${prefix}FormID`], row[`${prefix}Name`], slot === 1 ? 'inorganic' : 'organic', context)
      inputs.push({ resourceId: input.id, quantity: nonnegativeNumber(row[`${prefix}Qty`], `${context} input ${slot} quantity`, true) })
    }
    if (row.ResourceResolutionStatus === 'Resolved') {
      resourceId = resolveResource(row.ResourceFormID, row.ResourceName, 'organic', context).id
      const signature = JSON.stringify(inputs)
      const water = { resourceId: 'water', quantity: 1 }
      if (type === 'flora' && signature === JSON.stringify([water])) sourceClass = 'plant'
      if (type === 'fauna' && signature === JSON.stringify([water, { resourceId: 'fiber', quantity: 2 }])) sourceClass = 'herbivore'
      if (type === 'fauna' && signature === JSON.stringify([water, { resourceId: 'nutrient', quantity: 2 }])) sourceClass = 'carnivore'
      if (!sourceClass) throw new Error(`${context}: unexpected resolved farming signature ${row.SpeciesType} ${signature}.`)
      agree(organicFarmingProfiles, sourceClass, { sourceClass, inputs }, context)
    } else if (row.ResourceResolutionStatus === 'NoLinkedResource') {
      if (row.ResourceFormID || row.ResourceName || inputs.length) {
        throw new Error(`${context}: NoLinkedResource contradicts harvested resource or farming inputs.`)
      }
    } else {
      throw new Error(`${context}: unsupported ResourceResolutionStatus ${row.ResourceResolutionStatus}.`)
    }
    agree(planetSpecies, `${bodyId}:${speciesId}`, {
      bodyId, speciesId, sourceClass, domesticable: row.Domesticable === 'Yes', resourceId,
    }, context)
    agree(organicOccurrences, `${bodyBiomeId}:${speciesId}`, { bodyBiomeId, speciesId }, context)
  }

  // Presence includes wild harvests. Farmability is a separate planet/species fact.
  const resourcesByBody = new Map()
  for (const { bodyId, resourceId } of [...inorganicOccurrences.values(), ...planetSpecies.values()]) {
    if (resourceId === null) continue
    if (!resourcesByBody.has(bodyId)) resourcesByBody.set(bodyId, new Set())
    resourcesByBody.get(bodyId).add(resourceId)
  }
  const sorted = (map) => [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, value]) => value)
  const result = {
    biomes: sorted(biomes),
    bodyBiomes: sorted(bodyBiomes).sort((a, b) => a.bodyId.localeCompare(b.bodyId) || a.biomeIndex - b.biomeIndex),
    inorganicOccurrences: sorted(inorganicOccurrences),
    species: sorted(species),
    planetSpecies: sorted(planetSpecies),
    organicOccurrences: sorted(organicOccurrences),
    organicFarmingProfiles: sorted(organicFarmingProfiles),
    bodyResources: [...resourcesByBody].sort(([a], [b]) => a.localeCompare(b)).map(([bodyId, ids]) => ({ bodyId, resourceIds: [...ids].sort() })),
  }
  console.log('Inorganic sanity:', JSON.stringify({
    rows: inorganicRows.length,
    biome: inorganicRows.filter((row) => row.LocationType === 'BIOME').length,
    atmosphere: inorganicRows.filter((row) => row.LocationType === 'ATMOSPHERE').length,
    bodies: new Set(inorganicRows.map((row) => row.PlanetFormID)).size,
    resources: new Set(result.inorganicOccurrences.map((row) => row.resourceId)).size,
    bodyBiomes: new Set(result.inorganicOccurrences.filter((row) => row.location.type === 'biome').map((row) => row.location.bodyBiomeId)).size,
  }))
  console.log('Organic sanity:', JSON.stringify({
    rows: organicRows.length,
    resolved: organicRows.filter((row) => row.ResourceResolutionStatus === 'Resolved').length,
    noLinkedResource: organicRows.filter((row) => row.ResourceResolutionStatus === 'NoLinkedResource').length,
    domesticableYes: organicRows.filter((row) => row.Domesticable === 'Yes').length,
    domesticableNo: organicRows.filter((row) => row.Domesticable === 'No').length,
    sourceClassesByPlanetSpecies: Object.fromEntries(['plant', 'herbivore', 'carnivore', null].map((sourceClass) => [sourceClass, result.planetSpecies.filter((entry) => entry.sourceClass === sourceClass).length])),
    specialOccurrences: organicRows.filter((row) => row.ResourceResolutionStatus === 'NoLinkedResource').map((row) => ({ bodyId: row.PlanetFormID, species: row.SpeciesDisplayName })),
  }))
  console.log(`Crosswalk: ${resourceCrosswalk.size} canonical FormIDs; zero unresolved body/resource/input joins or biome/species conflicts.`)
  return result
}
