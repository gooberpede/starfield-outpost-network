/**
 * Purpose:
 *   Provide pure, immutable outpost transitions shared by application history and tests.
 *
 * Architecture:
 *   Owns grouped domain edits and their collateral resets, but not history
 *   entries or UI feedback. Callers can therefore record one deliberate user
 *   operation around each returned network change.
 *
 * Change this file when:
 *   Outpost transitions or their required collateral effects change.
 */
import type { Outpost, ResourceProductionRoute } from './models'
import { getProductionRouteKey } from './productionRoutes.ts'
import type { BodyBiomeId, PlanetaryBodyId, ResourceId, StarSystemId } from './referenceData'

export function changeOutpostSystem(outpost: Outpost, systemId: StarSystemId): Outpost {
  return { ...outpost, systemId, bodyId: '', selectedBiomeIds: [] }
}

export function changeOutpostBody(outpost: Outpost, bodyId: PlanetaryBodyId): Outpost {
  return { ...outpost, bodyId, selectedBiomeIds: [] }
}

export function toggleOutpostBiomeGroup(
  outpost: Outpost,
  bodyBiomeIds: BodyBiomeId[],
): Outpost {
  const selected = outpost.selectedBiomeIds.length > 0 &&
    bodyBiomeIds.every((id) => outpost.selectedBiomeIds.includes(id))
  const represented = new Set(bodyBiomeIds)
  return {
    ...outpost,
    selectedBiomeIds: selected
      ? outpost.selectedBiomeIds.filter((id) => !represented.has(id))
      : [...new Set([...outpost.selectedBiomeIds, ...bodyBiomeIds])],
  }
}

export function toggleOutpostProductionRoute(
  outpost: Outpost,
  route: ResourceProductionRoute,
): Outpost {
  const routeKey = getProductionRouteKey(route)
  const active = outpost.activeProduction.some(
    (candidate) => getProductionRouteKey(candidate) === routeKey,
  )
  return {
    ...outpost,
    activeProduction: active
      ? outpost.activeProduction.filter((candidate) => getProductionRouteKey(candidate) !== routeKey)
      : [
          ...outpost.activeProduction.filter((candidate) => !(
            route.type === 'organic' && candidate.type === 'organic-unspecified' &&
            candidate.resourceId === route.resourceId
          )),
          route,
        ],
  }
}

export function addExplicitResourcePresence(outpost: Outpost, resourceId: ResourceId): Outpost {
  if (outpost.explicitResourcePresence.includes(resourceId)) return outpost
  return { ...outpost, explicitResourcePresence: [...outpost.explicitResourcePresence, resourceId] }
}

/** Removing explicit presence also clears its exact inorganic route atomically. */
export function removeExplicitResourcePresence(outpost: Outpost, resourceId: ResourceId): Outpost {
  return {
    ...outpost,
    explicitResourcePresence: outpost.explicitResourcePresence.filter((id) => id !== resourceId),
    activeProduction: outpost.activeProduction.filter((route) => !(
      route.type === 'inorganic' && route.resourceId === resourceId
    )),
  }
}
