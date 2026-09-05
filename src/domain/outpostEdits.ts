/** Pure, immutable outpost edits shared by application history and regression tests. */
import type { Outpost, ResourceProductionRoute } from './models'
import { getProductionRouteKey } from './productionRoutes.ts'
import type { BodyBiomeId, PlanetaryBodyId, StarSystemId } from './referenceData'

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
