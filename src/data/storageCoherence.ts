/**
 * Purpose:
 *   Reject incoherent stored data before historical migration runs.
 *
 * Architecture:
 *   This is the strict pre-migration boundary for browser recovery. It protects
 *   ambiguous user data from being normalized or dropped by deliberately
 *   permissive migration code; it does not perform migration itself.
 *
 * Change this file when:
 *   Supported stored shapes or pre-migration coherence requirements change.
 */
import { CURRENT_COLLECTION_SCHEMA_VERSION, type NetworkCollection } from './networkCollection.ts'
import { CURRENT_SCHEMA_VERSION } from './networkMigration.ts'

type RecordValue = Record<string, unknown>
const record = (value: unknown): value is RecordValue =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
const validId = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0
function requireShape(condition: boolean): asserts condition {
  if (!condition) throw new Error('Stored collection is incoherent')
}
function stringArray(value: unknown): boolean {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}
function items(value: unknown): boolean {
  return Array.isArray(value) && value.every((item) => record(item) &&
    (item.type === 'resource' || item.type === 'product') && typeof item.id === 'string')
}

function validateNetworkSource(value: unknown): void {
  requireShape(record(value))
  const version = value.schemaVersion === undefined ? 1 : value.schemaVersion
  requireShape(typeof version === 'number' && Number.isInteger(version) &&
    version >= 1 && version <= CURRENT_SCHEMA_VERSION)
  requireShape(record(value.character) && Array.isArray(value.outposts))
  const character = value.character
  requireShape(typeof character.name === 'string' &&
    (character.level === null || typeof character.level === 'number') &&
    record(character.skills))
  for (const skill of ['outpostManagement', 'outpostEngineering',
    'planetaryHabitation', 'researchMethods', 'specialProjects']) {
    requireShape(character.skills[skill] === null ||
      typeof character.skills[skill] === 'number')
  }
  if (version >= 4) requireShape(record(character.capabilities) &&
    typeof character.capabilities.xTechExtraction === 'boolean')
  if (version >= 4) requireShape(value.schemaVersion === CURRENT_SCHEMA_VERSION)
  for (const outpost of value.outposts) {
    requireShape(record(outpost) && validId(outpost.id) && typeof outpost.name === 'string')
    for (const field of ['selectedBiomeIds', 'localResources', 'explicitResourcePresence']) {
      if (field in outpost) requireShape(stringArray(outpost[field]))
    }
    for (const field of ['systemId', 'system', 'bodyId', 'body']) {
      if (field in outpost) requireShape(typeof outpost[field] === 'string')
    }
    if (version >= 4) requireShape(stringArray(outpost.explicitResourcePresence))
    if (version >= 4) {
      requireShape(typeof outpost.systemId === 'string' &&
        typeof outpost.bodyId === 'string' &&
        stringArray(outpost.selectedBiomeIds) && stringArray(outpost.localResources))
    }
    for (const field of ['manufacturing', 'plannedSupply', 'activeProduction', 'cargoPads']) {
      if (field in outpost) requireShape(Array.isArray(outpost[field]))
      else if (version >= 2) requireShape(false)
    }
    if ('plannedSupply' in outpost) requireShape(items(outpost.plannedSupply))
    if (Array.isArray(outpost.manufacturing)) for (const item of outpost.manufacturing) {
      requireShape(record(item) && typeof item.productId === 'string' &&
        typeof item.quantity === 'number')
    }
    if (Array.isArray(outpost.activeProduction)) for (const route of outpost.activeProduction) {
      requireShape((version <= 2 && typeof route === 'string') ||
        (record(route) && typeof route.resourceId === 'string' &&
          (route.type === 'inorganic' || route.type === 'organic-unspecified' ||
            (route.type === 'organic' && typeof route.speciesId === 'string'))))
    }
    if (Array.isArray(outpost.cargoPads)) for (const pad of outpost.cargoPads) {
      requireShape(record(pad) && validId(pad.id) && typeof pad.label === 'string' &&
        (pad.type === 'regular' || pad.type === 'interstellar'))
      if ('outboundItems' in pad) requireShape(items(pad.outboundItems))
      else if (version >= 2) requireShape(false)
      if ('link' in pad) {
        requireShape(version === 1)
      }
      if ('link' in pad && pad.link !== null) {
        requireShape(record(pad.link))
        const link = pad.link
        if ('exports' in link) requireShape(items(link.exports))
        if ('destination' in link && link.destination !== null) {
          requireShape(record(link.destination) && link.destination.type === 'outpost' &&
            typeof link.destination.outpostId === 'string')
          // Schema 1 could identify an outpost without its exact pad. Migration
          // retains exports and leaves that relationship unlinked.
          if ('cargoPadId' in link.destination) {
            requireShape(typeof link.destination.cargoPadId === 'string')
          }
        }
      }
    }
  }
  if ('cargoLinks' in value) {
    requireShape(Array.isArray(value.cargoLinks))
    const relationships = new Set<string>()
    for (const link of value.cargoLinks) {
      requireShape(record(link) && validId(link.id) &&
        record(link.endpointA) && record(link.endpointB))
      for (const endpoint of [link.endpointA, link.endpointB]) {
        requireShape(typeof endpoint.outpostId === 'string' &&
          typeof endpoint.cargoPadId === 'string')
      }
      const a = link.endpointA
      const b = link.endpointB
      const key = [`${a.outpostId}:${a.cargoPadId}`, `${b.outpostId}:${b.cargoPadId}`].sort().join('|')
      requireShape(!relationships.has(key))
      relationships.add(key)
    }
  } else if (version >= 2) requireShape(false)
}

export function validateStoredSource(value: unknown): void {
  if (record(value) && 'networks' in value) {
    requireShape(value.schemaVersion === CURRENT_COLLECTION_SCHEMA_VERSION &&
      Array.isArray(value.networks) && value.networks.length > 0 &&
      validId(value.activeNetworkId))
    const ids = new Set<string>()
    for (const entry of value.networks) {
      requireShape(record(entry) && validId(entry.id) && !ids.has(entry.id))
      ids.add(entry.id)
      validateNetworkSource(entry.network)
    }
    requireShape(ids.has(value.activeNetworkId))
  } else validateNetworkSource(value)
}

/** Check current runtime identity scopes after deterministic migration. */
export function validateRecoveredCollection(collection: NetworkCollection): void {
  requireShape(collection.schemaVersion === CURRENT_COLLECTION_SCHEMA_VERSION &&
    collection.networks.length > 0)
  const networkIds = new Set<string>()
  for (const saved of collection.networks) {
    requireShape(validId(saved.id) && !networkIds.has(saved.id) &&
      saved.network.schemaVersion === CURRENT_SCHEMA_VERSION)
    networkIds.add(saved.id)
    const outpostIds = new Set<string>()
    const linkIds = new Set<string>()
    for (const outpost of saved.network.outposts) {
      requireShape(validId(outpost.id) && !outpostIds.has(outpost.id))
      outpostIds.add(outpost.id)
      const padIds = new Set<string>()
      for (const pad of outpost.cargoPads) {
        requireShape(validId(pad.id) && !padIds.has(pad.id))
        padIds.add(pad.id)
      }
    }
    for (const link of saved.network.cargoLinks) {
      requireShape(validId(link.id) && !linkIds.has(link.id))
      linkIds.add(link.id)
    }
  }
  requireShape(networkIds.has(collection.activeNetworkId))
}
