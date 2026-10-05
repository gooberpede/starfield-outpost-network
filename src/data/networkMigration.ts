/**
 * Purpose: Upgrade persisted/imported network shapes to schema version 5.
 * Architecture: Migration preserves recoverable IDs; validation owns contradictions.
 * Change this file when: the persisted network schema changes.
 */
import type {
  CargoItem,
  CargoPad,
  CargoLink,
  Character,
  OutpostNetwork,
  ResourceProductionRoute,
} from '../domain/models'
import type { ResourceCategory, ResourceId } from '../domain/referenceData'

export const CURRENT_SCHEMA_VERSION = 5

type ResourceCategoryResolver = (resourceId: ResourceId) => ResourceCategory | undefined

/* Historical schema-2 migration snapshot. Unknown IDs use inorganic as the
 * least-destructive route because it carries no invented species identity. */
const LEGACY_ORGANIC_RESOURCE_IDS = new Set([
  'adhesive', 'amino-acids', 'analgesic', 'antimicrobial', 'aromatic',
  'biosuppressant', 'cosmetic', 'fiber', 'gastronomic-delight', 'hallucinogen',
  'high-tensile-spidroin', 'hypercatalyst', 'immunostimulant', 'lubricant',
  'luxury-textile', 'membrane', 'memory-substrate', 'metabolic-agent',
  'neurologic', 'nutrient', 'ornamental', 'pigment', 'polymer', 'sealant',
  'sedative', 'solvent', 'spice', 'stimulant', 'structural', 'toxin',
])

function defaultCategoryResolver(resourceId: ResourceId): ResourceCategory | undefined {
  return LEGACY_ORGANIC_RESOURCE_IDS.has(resourceId) ? 'organic' : undefined
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function migrateCharacter(value: Record<string, unknown>, sourceSchemaVersion: number): Character {
  if (typeof value.name !== 'string' ||
    (value.level !== null && typeof value.level !== 'number') ||
    !isRecord(value.skills)) {
    throw new Error('The selected file contains invalid character data.')
  }
  const skills = value.skills
  const capabilities = value.capabilities
  if (sourceSchemaVersion >= 4 &&
    (!isRecord(capabilities) || typeof capabilities.xTechExtraction !== 'boolean')) {
    throw new Error('The selected file contains invalid character capability data.')
  }
  const readRank = (key: string): number | null => {
    const rank = skills[key]
    if (rank === null || typeof rank === 'number') return rank
    throw new Error('The selected file contains invalid character skill data.')
  }
  return {
    name: value.name,
    level: value.level,
    skills: {
      outpostManagement: readRank('outpostManagement'),
      outpostEngineering: readRank('outpostEngineering'),
      planetaryHabitation: readRank('planetaryHabitation'),
      researchMethods: readRank('researchMethods'),
      specialProjects: readRank('specialProjects'),
    },
    capabilities: {
      xTechExtraction: sourceSchemaVersion >= 4
        ? (capabilities as Record<string, unknown>).xTechExtraction as boolean
        : true,
    },
  }
}

function migrateRoute(
  value: unknown,
  resolveCategory: ResourceCategoryResolver,
): ResourceProductionRoute | null {
  if (typeof value === 'string') {
    return resolveCategory(value) === 'organic'
      ? { type: 'organic-unspecified', resourceId: value }
      : { type: 'inorganic', resourceId: value }
  }
  if (!isRecord(value) || typeof value.resourceId !== 'string') return null
  if (value.type === 'organic' && typeof value.speciesId === 'string') {
    return { type: 'organic', resourceId: value.resourceId, speciesId: value.speciesId }
  }
  if (value.type === 'inorganic' || value.type === 'organic-unspecified') {
    return { type: value.type, resourceId: value.resourceId }
  }
  return null
}

function cargoLinkKey(endpointA: CargoLink['endpointA'], endpointB: CargoLink['endpointB']) {
  return [
    JSON.stringify([endpointA.outpostId, endpointA.cargoPadId]),
    JSON.stringify([endpointB.outpostId, endpointB.cargoPadId]),
  ].sort().map((key) => JSON.stringify(key)).join()
}

export function migrateNetworkData(
  value: unknown,
  resolveCategory: ResourceCategoryResolver = defaultCategoryResolver,
): OutpostNetwork {
  if (!isRecord(value) || !isRecord(value.character) || !Array.isArray(value.outposts)) {
    throw new Error('The selected file is not a valid outpost network.')
  }
  const sourceSchemaVersion = typeof value.schemaVersion === 'number' ? value.schemaVersion : 1
  if (sourceSchemaVersion > CURRENT_SCHEMA_VERSION) {
    throw new Error(`Unsupported network schema version: ${sourceSchemaVersion}`)
  }

  const migratedLinks: CargoLink[] = []
  const linkKeys = new Set<string>()
  const outposts = value.outposts.map((rawOutpost) => {
    if (!isRecord(rawOutpost) || typeof rawOutpost.id !== 'string' ||
      typeof rawOutpost.name !== 'string') {
      throw new Error('The selected file contains an invalid outpost.')
    }
    if (sourceSchemaVersion >= 4 && !Array.isArray(rawOutpost.explicitResourcePresence)) {
      throw new Error('The selected file contains invalid explicit resource presence data.')
    }
    const rawPads = Array.isArray(rawOutpost.cargoPads) ? rawOutpost.cargoPads : []
    const cargoPads: CargoPad[] = rawPads.map((rawPad) => {
      if (!isRecord(rawPad) || typeof rawPad.id !== 'string' ||
        typeof rawPad.label !== 'string' ||
        (rawPad.type !== 'regular' && rawPad.type !== 'interstellar')) {
        throw new Error('The selected file contains an invalid cargo pad.')
      }
      const legacyLink = isRecord(rawPad.link) ? rawPad.link : null
      const destination = legacyLink && isRecord(legacyLink.destination)
        ? legacyLink.destination : null
      if (destination?.type === 'outpost' && typeof destination.outpostId === 'string' &&
        typeof destination.cargoPadId === 'string') {
        const endpointA = { outpostId: rawOutpost.id as string, cargoPadId: rawPad.id }
        const endpointB = { outpostId: destination.outpostId, cargoPadId: destination.cargoPadId }
        const key = cargoLinkKey(endpointA, endpointB)
        if (!linkKeys.has(key)) {
          linkKeys.add(key)
          migratedLinks.push({ id: crypto.randomUUID(), endpointA, endpointB })
        }
      }
      const outboundItems = Array.isArray(rawPad.outboundItems)
        ? rawPad.outboundItems
        : legacyLink && Array.isArray(legacyLink.exports) ? legacyLink.exports : []
      const padType: 'regular' | 'interstellar' = rawPad.type
      return {
        id: rawPad.id,
        label: rawPad.label,
        type: padType,
        outboundItems: outboundItems as CargoItem[],
        ...(isRecord(rawPad.destinationIntent) && typeof rawPad.destinationIntent.outpostId === 'string'
          ? { destinationIntent: { outpostId: rawPad.destinationIntent.outpostId } }
          : sourceSchemaVersion === 1 && destination?.type === 'outpost' &&
            typeof destination.outpostId === 'string' && destination.outpostId.length > 0 &&
            !('cargoPadId' in destination)
            ? { destinationIntent: { outpostId: destination.outpostId } } : {}),
      }
    })

    return {
      id: rawOutpost.id,
      name: rawOutpost.name,
      systemId: typeof rawOutpost.systemId === 'string' ? rawOutpost.systemId
        : typeof rawOutpost.system === 'string' ? rawOutpost.system : '',
      bodyId: typeof rawOutpost.bodyId === 'string' ? rawOutpost.bodyId
        : typeof rawOutpost.body === 'string' ? rawOutpost.body : '',
      selectedBiomeIds: Array.isArray(rawOutpost.selectedBiomeIds)
        ? rawOutpost.selectedBiomeIds.filter((id): id is string => typeof id === 'string') : [],
      localResources: Array.isArray(rawOutpost.localResources)
        ? rawOutpost.localResources.filter((id): id is string => typeof id === 'string') : [],
      explicitResourcePresence: sourceSchemaVersion >= 4 && Array.isArray(rawOutpost.explicitResourcePresence)
        ? rawOutpost.explicitResourcePresence.filter((id): id is string => typeof id === 'string') : [],
      activeProduction: (Array.isArray(rawOutpost.activeProduction) ? rawOutpost.activeProduction : [])
        .map((route) => migrateRoute(route, resolveCategory))
        .filter((route): route is ResourceProductionRoute => route !== null),
      manufacturing: Array.isArray(rawOutpost.manufacturing) ? rawOutpost.manufacturing : [],
      plannedSupply: Array.isArray(rawOutpost.plannedSupply) ? rawOutpost.plannedSupply : [],
      cargoPads,
    }
  })

  if (Array.isArray(value.cargoLinks)) {
    for (const rawLink of value.cargoLinks) {
      if (!isRecord(rawLink) || typeof rawLink.id !== 'string' ||
        !isRecord(rawLink.endpointA) || !isRecord(rawLink.endpointB)) continue
      if (typeof rawLink.endpointA.outpostId !== 'string' ||
        typeof rawLink.endpointA.cargoPadId !== 'string' ||
        typeof rawLink.endpointB.outpostId !== 'string' ||
        typeof rawLink.endpointB.cargoPadId !== 'string') continue
      const endpointA = {
        outpostId: rawLink.endpointA.outpostId,
        cargoPadId: rawLink.endpointA.cargoPadId,
      }
      const endpointB = {
        outpostId: rawLink.endpointB.outpostId,
        cargoPadId: rawLink.endpointB.cargoPadId,
      }
      const key = cargoLinkKey(endpointA, endpointB)
      if (!linkKeys.has(key)) {
        linkKeys.add(key)
        migratedLinks.push({ id: rawLink.id, endpointA, endpointB })
      }
    }
  }

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    character: migrateCharacter(value.character, sourceSchemaVersion),
    // Legacy outpost-only evidence cannot compete with retained exact claims.
    outposts: sourceSchemaVersion === 1 ? outposts.map((outpost) => ({ ...outpost,
      cargoPads: outpost.cargoPads.map((pad) => {
        if (!pad.destinationIntent || !migratedLinks.some((link) =>
          [link.endpointA, link.endpointB].some((e) => e.outpostId === outpost.id && e.cargoPadId === pad.id))) return pad
        const copy = { ...pad }; delete copy.destinationIntent; return copy
      }),
    })) : outposts,
    cargoLinks: migratedLinks,
  }
}
