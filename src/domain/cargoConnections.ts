/**
 * Purpose: Resolve cargo claims and own immutable destination edits.
 * Architecture: Raw claims survive invalid imports; only structurally resolved
 * pairs route. Commands never manufacture intent on a former partner.
 * Change this file when: cargo identity, resolution or transition rules change.
 */
import type { CargoLink, CargoLinkEndpoint, CargoPad, OutpostNetwork } from './models.ts'
import type { ReferenceData } from './referenceData.ts'
import { getInvariantCargoPadLabel } from './cargoPadLabels.ts'

type CargoNetwork = Pick<OutpostNetwork, 'outposts' | 'cargoLinks'>
export const endpointKey = (e: CargoLinkEndpoint): string => JSON.stringify([e.outpostId, e.cargoPadId])
export const sameEndpoint = (a: CargoLinkEndpoint, b: CargoLinkEndpoint): boolean =>
  a.outpostId === b.outpostId && a.cargoPadId === b.cargoPadId
export const incident = (link: CargoLink, e: CargoLinkEndpoint): boolean =>
  sameEndpoint(link.endpointA, e) || sameEndpoint(link.endpointB, e)
export const oppositeEndpoint = (link: CargoLink, e: CargoLinkEndpoint): CargoLinkEndpoint =>
  sameEndpoint(link.endpointA, e) ? link.endpointB : link.endpointA
export function resolveEndpoint(network: CargoNetwork, endpoint: CargoLinkEndpoint) {
  const outpost = network.outposts.find(({ id }) => id === endpoint.outpostId)
  const pad = outpost?.cargoPads.find(({ id }) => id === endpoint.cargoPadId)
  return { outpost, pad }
}

export function analyzeCargoConnections(network: CargoNetwork) {
  const claims = new Map<string, Map<string, CargoLink>>()
  for (const link of network.cargoLinks) {
    for (const endpoint of [link.endpointA, link.endpointB]) {
      const key = endpointKey(endpoint)
      const records = claims.get(key) ?? new Map<string, CargoLink>()
      records.set(link.id, link)
      claims.set(key, records)
    }
  }
  const at = (endpoint: CargoLinkEndpoint) => [...(claims.get(endpointKey(endpoint))?.values() ?? [])]
  const conflicting = (link: CargoLink) => at(link.endpointA).length > 1 || at(link.endpointB).length > 1
  const eligible = network.cargoLinks.filter((link) =>
    !conflicting(link) && !sameEndpoint(link.endpointA, link.endpointB) &&
    resolveEndpoint(network, link.endpointA).pad && resolveEndpoint(network, link.endpointB).pad)
  // Context stops at direct competitors, rather than expanding a whole graph.
  const conflictContext = (owner: CargoLinkEndpoint): CargoLink[] => {
    const records = new Map<string, CargoLink>()
    for (const link of at(owner).filter(conflicting)) {
      for (const e of [link.endpointA, link.endpointB]) {
        for (const competitor of at(e)) records.set(competitor.id, competitor)
      }
    }
    return [...records.values()].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
  }
  return { at, conflicting, eligible, conflictContext }
}
export const getEligibleCargoLinks = (network: CargoNetwork): CargoLink[] => analyzeCargoConnections(network).eligible

export type CargoDestinationState =
  | { kind: 'unlinked' }
  | { kind: 'incomplete'; target: { outpostId: string } }
  | { kind: 'connected' | 'missing-pad'; target: CargoLinkEndpoint; link: CargoLink }
  | { kind: 'missing-outpost'; target: { outpostId: string }; link?: CargoLink }
  | { kind: 'conflict'; records: CargoLink[] }
  | { kind: 'self-reference'; link: CargoLink }

export function classifyCargoDestination(network: CargoNetwork, owner: CargoLinkEndpoint): CargoDestinationState {
  const analysis = analyzeCargoConnections(network)
  const records = analysis.at(owner)
  if (records.some(analysis.conflicting)) return { kind: 'conflict', records: analysis.conflictContext(owner) }
  const link = records[0]
  if (link) {
    if (sameEndpoint(link.endpointA, link.endpointB)) return { kind: 'self-reference', link }
    const target = oppositeEndpoint(link, owner)
    const resolved = resolveEndpoint(network, target)
    if (!resolved.outpost) return { kind: 'missing-outpost', target, link }
    return { kind: resolved.pad ? 'connected' : 'missing-pad', target, link }
  }
  const target = resolveEndpoint(network, owner).pad?.destinationIntent
  return target ? { kind: network.outposts.some(({ id }) => id === target.outpostId)
    ? 'incomplete' : 'missing-outpost', target } : { kind: 'unlinked' }
}

function withoutIntent(pad: CargoPad): CargoPad {
  if (!pad.destinationIntent) return pad
  const copy = { ...pad }
  delete copy.destinationIntent
  return copy
}
function editable(network: CargoNetwork, owner: CargoLinkEndpoint): boolean {
  const state = classifyCargoDestination(network, owner)
  return !!resolveEndpoint(network, owner).pad && state.kind !== 'conflict' && state.kind !== 'self-reference'
}
export function selectCargoDestination(network: OutpostNetwork, owner: CargoLinkEndpoint, outpostId: string): OutpostNetwork {
  if (!editable(network, owner) || outpostId === owner.outpostId ||
    (outpostId && !network.outposts.some(({ id }) => id === outpostId))) return network
  const state = classifyCargoDestination(network, owner)
  const current = 'target' in state ? state.target.outpostId : ''
  if (current === outpostId && (outpostId !== '' || state.kind === 'unlinked')) return network
  return { ...network, cargoLinks: network.cargoLinks.filter((link) => !incident(link, owner)),
    outposts: network.outposts.map((outpost) => outpost.id !== owner.outpostId ? outpost : {
      ...outpost, cargoPads: outpost.cargoPads.map((pad) => pad.id !== owner.cargoPadId ? pad :
        outpostId ? { ...pad, destinationIntent: { outpostId } } : withoutIntent(pad)),
    }) }
}
export function connectCargoPads(network: OutpostNetwork, owner: CargoLinkEndpoint,
  target: CargoLinkEndpoint, linkId: string): OutpostNetwork {
  if (!linkId || network.cargoLinks.some(({ id }) => id === linkId) || owner.outpostId === target.outpostId ||
    !editable(network, owner) || !editable(network, target)) return network
  const state = classifyCargoDestination(network, owner)
  if (state.kind === 'connected' && sameEndpoint(state.target, target)) return network
  return { ...network,
    cargoLinks: [...network.cargoLinks.filter((link) => !incident(link, owner) && !incident(link, target)),
      { id: linkId, endpointA: owner, endpointB: target }],
    outposts: network.outposts.map((outpost) => ({ ...outpost,
      cargoPads: outpost.cargoPads.map((pad) =>
        sameEndpoint({ outpostId: outpost.id, cargoPadId: pad.id }, owner) ||
        sameEndpoint({ outpostId: outpost.id, cargoPadId: pad.id }, target) ? withoutIntent(pad) : pad),
    })),
  }
}
export function createRemoteCargoPadAndConnect(network: OutpostNetwork, owner: CargoLinkEndpoint,
  targetOutpostId: string, padId: string, linkId: string, referenceData?: ReferenceData): OutpostNetwork {
  const state = classifyCargoDestination(network, owner)
  const local = resolveEndpoint(network, owner)
  const remote = network.outposts.find(({ id }) => id === targetOutpostId)
  const target = { outpostId: targetOutpostId, cargoPadId: padId }
  if (!editable(network, owner) || !('target' in state) || state.target.outpostId !== targetOutpostId ||
    !remote || !local.outpost || !local.pad || remote.id === owner.outpostId || !padId ||
    remote.cargoPads.some(({ id }) => id === padId) || network.cargoLinks.some((link) => incident(link, target)) ||
    !linkId || network.cargoLinks.some(({ id }) => id === linkId)) return network
  const known = (id: string) => !!id.trim() && referenceData?.systems.some((system) => system.id === id)
  const type = known(local.outpost.systemId) && known(remote.systemId)
    ? local.outpost.systemId === remote.systemId ? 'regular' : 'interstellar' : local.pad.type
  const added: OutpostNetwork = { ...network, outposts: network.outposts.map((outpost) => outpost !== remote ? outpost : {
    ...outpost, cargoPads: [...outpost.cargoPads, { id: padId, label: getInvariantCargoPadLabel(outpost.cargoPads.length), type, outboundItems: [] }],
  }) }
  return connectCargoPads(added, owner, target, linkId)
}
/** Identified repair deliberately permits ambiguity; it removes just this record. */
export function removeCargoPairing(network: OutpostNetwork, owner: CargoLinkEndpoint, expected: CargoLink): OutpostNetwork {
  const current = network.cargoLinks.find(({ id }) => id === expected.id)
  if (!resolveEndpoint(network, owner).pad || !current || !incident(current, owner) ||
    !sameEndpoint(current.endpointA, expected.endpointA) || !sameEndpoint(current.endpointB, expected.endpointB)) return network
  return { ...network, cargoLinks: network.cargoLinks.filter(({ id }) => id !== expected.id) }
}
