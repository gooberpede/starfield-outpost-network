/**
 * Purpose: Validate untrusted external imports before and after migration.
 * Architecture: Raw checks prevent lossy recovery from hiding malformed data;
 * current-shape checks establish the runtime contract and stable identity scopes.
 * Change this file when: persisted structures or supported migrations change.
 */
import type { NetworkCollection } from './networkCollection.ts'
import { CURRENT_COLLECTION_SCHEMA_VERSION } from './networkCollection.ts'
import { NetworkImportError } from './importErrors.ts'
import { CURRENT_SCHEMA_VERSION } from './networkMigration.ts'

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function failStructure(path: string): never {
  throw new NetworkImportError('invalid-structure', { path })
}

function requireRecord(value: unknown, path: string): UnknownRecord {
  if (!isRecord(value)) failStructure(path)
  return value
}

function requireArray(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) failStructure(path)
  return value
}

function requireString(value: unknown, path: string): string {
  if (typeof value !== 'string') failStructure(path)
  return value
}

function requireNumberOrNull(value: unknown, path: string): void {
  if (value !== null && typeof value !== 'number') failStructure(path)
}

function validateStringArray(value: unknown, path: string): void {
  requireArray(value, path).forEach((entry, index) => requireString(entry, `${path}[${index}]`))
}

function validateCargoItem(value: unknown, path: string): void {
  const item = requireRecord(value, path)
  if (item.type !== 'resource' && item.type !== 'product') failStructure(`${path}.type`)
  requireString(item.id, `${path}.id`)
}

function validateCargoItems(value: unknown, path: string): void {
  requireArray(value, path).forEach((entry, index) => validateCargoItem(entry, `${path}[${index}]`))
}

function validateProductionRoute(value: unknown, path: string, sourceVersion: number): void {
  if (typeof value === 'string') {
    if (sourceVersion > 2) failStructure(path)
    return
  }
  const route = requireRecord(value, path)
  requireString(route.resourceId, `${path}.resourceId`)
  if (route.type === 'organic') {
    requireString(route.speciesId, `${path}.speciesId`)
  } else if (route.type !== 'inorganic' && route.type !== 'organic-unspecified') {
    failStructure(`${path}.type`)
  }
}

function validateEndpoint(value: unknown, path: string): void {
  const endpoint = requireRecord(value, path)
  requireString(endpoint.outpostId, `${path}.outpostId`)
  requireString(endpoint.cargoPadId, `${path}.cargoPadId`)
}

function validateLegacyPadLink(value: unknown, path: string): void {
  const link = requireRecord(value, path)
  if ('exports' in link) validateCargoItems(link.exports, `${path}.exports`)
  if (!('destination' in link) || link.destination === null) return
  const destination = requireRecord(link.destination, `${path}.destination`)
  if (destination.type !== 'outpost') failStructure(`${path}.destination.type`)
  requireString(destination.outpostId, `${path}.destination.outpostId`)
  requireString(destination.cargoPadId, `${path}.destination.cargoPadId`)
}

function validateCharacter(value: unknown, path: string, sourceVersion: number): void {
  const character = requireRecord(value, path)
  requireString(character.name, `${path}.name`)
  requireNumberOrNull(character.level, `${path}.level`)
  const skills = requireRecord(character.skills, `${path}.skills`)
  for (const key of [
    'outpostManagement', 'outpostEngineering', 'planetaryHabitation',
    'researchMethods', 'specialProjects',
  ]) requireNumberOrNull(skills[key], `${path}.skills.${key}`)

  if (sourceVersion >= 4 || 'capabilities' in character) {
    const capabilities = requireRecord(character.capabilities, `${path}.capabilities`)
    if (typeof capabilities.xTechExtraction !== 'boolean') {
      failStructure(`${path}.capabilities.xTechExtraction`)
    }
  }
}

function validateOutpost(value: unknown, path: string, sourceVersion: number): void {
  const outpost = requireRecord(value, path)
  requireString(outpost.id, `${path}.id`)
  requireString(outpost.name, `${path}.name`)

  if (sourceVersion >= 2) {
    requireString(outpost.systemId, `${path}.systemId`)
    requireString(outpost.bodyId, `${path}.bodyId`)
    for (const key of [
      'localResources', 'activeProduction', 'manufacturing', 'plannedSupply', 'cargoPads',
    ]) {
      if (!(key in outpost)) failStructure(`${path}.${key}`)
    }
  }
  if (sourceVersion >= 3 && !('selectedBiomeIds' in outpost)) {
    failStructure(`${path}.selectedBiomeIds`)
  }

  for (const key of ['systemId', 'system', 'bodyId', 'body']) {
    if (key in outpost) requireString(outpost[key], `${path}.${key}`)
  }
  for (const key of ['selectedBiomeIds', 'localResources', 'explicitResourcePresence']) {
    if (key in outpost) validateStringArray(outpost[key], `${path}.${key}`)
  }
  if (sourceVersion >= 4 && !('explicitResourcePresence' in outpost)) {
    failStructure(`${path}.explicitResourcePresence`)
  }

  if ('activeProduction' in outpost) {
    requireArray(outpost.activeProduction, `${path}.activeProduction`).forEach(
      (route, index) => validateProductionRoute(route, `${path}.activeProduction[${index}]`, sourceVersion),
    )
  }
  if ('manufacturing' in outpost) {
    requireArray(outpost.manufacturing, `${path}.manufacturing`).forEach((entry, index) => {
      const item = requireRecord(entry, `${path}.manufacturing[${index}]`)
      requireString(item.productId, `${path}.manufacturing[${index}].productId`)
      if (typeof item.quantity !== 'number') failStructure(`${path}.manufacturing[${index}].quantity`)
    })
  }
  if ('plannedSupply' in outpost) validateCargoItems(outpost.plannedSupply, `${path}.plannedSupply`)

  if ('cargoPads' in outpost) {
    requireArray(outpost.cargoPads, `${path}.cargoPads`).forEach((entry, index) => {
      const padPath = `${path}.cargoPads[${index}]`
      const pad = requireRecord(entry, padPath)
      requireString(pad.id, `${padPath}.id`)
      requireString(pad.label, `${padPath}.label`)
      if (pad.type !== 'regular' && pad.type !== 'interstellar') failStructure(`${padPath}.type`)
      if ('outboundItems' in pad) validateCargoItems(pad.outboundItems, `${padPath}.outboundItems`)
      else if (sourceVersion >= 2) failStructure(`${padPath}.outboundItems`)
      if ('link' in pad) {
        if (sourceVersion !== 1) failStructure(`${padPath}.link`)
        if (pad.link !== null) validateLegacyPadLink(pad.link, `${padPath}.link`)
      }
    })
  }
}

function validateCargoLinks(value: unknown, path: string): void {
  const relationshipKeys = new Set<string>()
  requireArray(value, path).forEach((entry, index) => {
    const linkPath = `${path}[${index}]`
    const link = requireRecord(entry, linkPath)
    requireString(link.id, `${linkPath}.id`)
    validateEndpoint(link.endpointA, `${linkPath}.endpointA`)
    validateEndpoint(link.endpointB, `${linkPath}.endpointB`)
    const endpointA = link.endpointA as UnknownRecord
    const endpointB = link.endpointB as UnknownRecord
    const relationshipKey = [
      `${endpointA.outpostId}:${endpointA.cargoPadId}`,
      `${endpointB.outpostId}:${endpointB.cargoPadId}`,
    ].sort().join('|')
    if (relationshipKeys.has(relationshipKey)) failStructure(linkPath)
    relationshipKeys.add(relationshipKey)
  })
}

/** Validates every raw member migration may otherwise default, filter, or discard. */
export function validateExternalNetworkSource(value: unknown, path: string): void {
  const network = requireRecord(value, path)
  const sourceVersion = 'schemaVersion' in network ? network.schemaVersion : 1
  if (typeof sourceVersion !== 'number' || !Number.isInteger(sourceVersion) || sourceVersion < 1) {
    failStructure(`${path}.schemaVersion`)
  }
  if (sourceVersion > CURRENT_SCHEMA_VERSION) {
    throw new NetworkImportError('unsupported-network-schema', { version: sourceVersion })
  }
  validateCharacter(network.character, `${path}.character`, sourceVersion)
  requireArray(network.outposts, `${path}.outposts`).forEach(
    (outpost, index) => validateOutpost(outpost, `${path}.outposts[${index}]`, sourceVersion),
  )
  if (sourceVersion >= 2 && !('cargoLinks' in network)) failStructure(`${path}.cargoLinks`)
  if ('cargoLinks' in network) validateCargoLinks(network.cargoLinks, `${path}.cargoLinks`)
}

function requireStableId(
  id: string,
  seen: Set<string>,
  scope: string,
): void {
  if (!id) throw new NetworkImportError('invalid-identity', { reason: 'empty', scope })
  if (seen.has(id)) {
    throw new NetworkImportError('invalid-identity', { reason: 'duplicate', scope, id })
  }
  seen.add(id)
}

/** Establishes the complete current runtime shape and natural identity namespaces. */
export function validateImportedCollection(collection: NetworkCollection): void {
  if (collection.schemaVersion !== CURRENT_COLLECTION_SCHEMA_VERSION) failStructure('schemaVersion')
  requireString(collection.activeNetworkId, 'activeNetworkId')
  const networkIds = new Set<string>()
  collection.networks.forEach((savedNetwork, networkIndex) => {
    requireStableId(savedNetwork.id, networkIds, 'network')
    const path = `networks[${networkIndex}].network`
    const network = savedNetwork.network
    if (network.schemaVersion !== CURRENT_SCHEMA_VERSION) failStructure(`${path}.schemaVersion`)
    validateCharacter(network.character, `${path}.character`, CURRENT_SCHEMA_VERSION)
    validateCargoLinks(network.cargoLinks, `${path}.cargoLinks`)

    const outpostIds = new Set<string>()
    const cargoLinkIds = new Set<string>()
    network.cargoLinks.forEach((link) => requireStableId(link.id, cargoLinkIds, 'cargo-link'))
    network.outposts.forEach((outpost, outpostIndex) => {
      validateOutpost(outpost, `${path}.outposts[${outpostIndex}]`, CURRENT_SCHEMA_VERSION)
      requireStableId(outpost.id, outpostIds, 'outpost')
      const cargoPadIds = new Set<string>()
      outpost.cargoPads.forEach((pad) => requireStableId(pad.id, cargoPadIds, 'cargo-pad'))
    })
  })
}
