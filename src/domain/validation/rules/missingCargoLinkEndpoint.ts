/**
 * Purpose: Diagnose retained missing references without fabricating deletion history.
 * Architecture: Surviving owners receive repair navigation; wholly orphaned
 * claims retain network-scoped evidence. Missing parents suppress missing pads.
 * Change this file when: missing cargo evidence or diagnostic ownership changes.
 */
import { resolveEndpoint, endpointKey, analyzeCargoConnections } from '../../cargoConnections.ts'
import type { CargoLinkEndpoint } from '../../models.ts'
import type { ValidationIssue, ValidationRule } from '../types.ts'
export const missingCargoLinkEndpointRule: ValidationRule = {
  id: 'cargo-link-endpoint-missing', name: 'Missing cargo endpoint',
  description: 'Flags unavailable targets retained in pairing claims or unfinished choices.',
  category: 'structural', defaultSeverity: 'error',
  validate(network) {
    const issues = new Map<string, ValidationIssue>()
    const analysis = analyzeCargoConnections(network)
    for (const link of network.cargoLinks) {
      const endpoints = [link.endpointA, link.endpointB]
      const owners = endpoints.filter((e) => resolveEndpoint(network, e).pad)
      for (const target of endpoints) {
        const resolved = resolveEndpoint(network, target)
        if (resolved.pad) continue
        const evidence = resolved.outpost ? target : { outpostId: target.outpostId }
        const add = (owner?: CargoLinkEndpoint) => {
          const key = JSON.stringify([owner ? endpointKey(owner) : null, evidence])
          const existing = issues.get(key)
          const records = [...(existing?.cargoRecords ?? []), link]
          const unique = [...new Map(records.map((r) => [r.id, r])).values()].sort((a,b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
          issues.set(key, { ...owner, ruleId: this.id, category: 'structural', severity: 'error',
            messageKey: !owner ? 'validation.cargoOrphan' : resolved.outpost ? 'validation.cargoMissingPad' : 'validation.cargoMissingOutpost',
            cargoTarget: evidence, cargoRecords: unique })
        }
        if (owners.length) owners.forEach(add)
        else add()
      }
    }
    for (const outpost of network.outposts) for (const pad of outpost.cargoPads) {
      const owner = { outpostId: outpost.id, cargoPadId: pad.id }
      const target = pad.destinationIntent
      if (target && !analysis.at(owner).length && !network.outposts.some(({id}) => id === target.outpostId)) {
        issues.set(JSON.stringify([endpointKey(owner), target]), { ...owner,
          ruleId: this.id, category: 'structural', severity: 'error', messageKey: 'validation.cargoMissingOutpost', cargoTarget: target })
      }
    }
    return [...issues.values()]
  },
}
