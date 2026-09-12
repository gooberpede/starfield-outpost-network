/**
 * Purpose: Resolve canonical star systems through PNDT.GNAM -> STDT.DNAM provenance.
 * Architecture: Canonical body rows own system identity; numeric game fields perform the join.
 * Change this file when: the audited C3 numeric field shapes or system population changes.
 */
import { parse } from 'csv-parse/sync'

import { extractLocalizedId, SEMANTIC_PATHS } from './localized-field-map.mjs'
import { PluginReaderError } from './starfield-plugin-reader.mjs'
import { verifyEnglish } from './localized-name-provenance.mjs'

export const OFFICIAL_SYSTEM_PLUGINS = Object.freeze([
  'Starfield.esm', 'ShatteredSpace.esm', 'SFBGS00D.esm', 'SFBGS050.esm',
])

function exactNumericSubrecord(record, signature, expectedSize, context) {
  const candidates = record.subrecords.filter((item) => item.signature === signature && item.size === expectedSize)
  if (candidates.length === 0) {
    const sameSignature = record.subrecords.filter((item) => item.signature === signature)
    const code = sameSignature.length > 0 ? 'UNSUPPORTED_RECORD_SHAPE' : `${context}_MISSING`
    throw new PluginReaderError(code, `${record.signature}.${signature} did not contain one ${expectedSize}-byte audited payload.`, {
      recordSignature: record.signature, formId: record.formIdHex,
      observedSizes: sameSignature.map((item) => item.size),
    })
  }
  if (candidates.length !== 1) {
    throw new PluginReaderError('UNSUPPORTED_RECORD_SHAPE', `${record.signature}.${signature} contained multiple audited payloads.`, {
      recordSignature: record.signature, formId: record.formIdHex, count: candidates.length,
    })
  }
  return candidates[0].data.readUInt32LE(0) >>> 0
}

/** PNDT has another four-byte GNAM; the audited Body/GNAM galaxy tuple is exactly 12 bytes. */
export function extractPndtSystemNumber(record) {
  if (record.signature !== 'PNDT') throw new PluginReaderError('UNSUPPORTED_RECORD_SHAPE', 'System-number extraction requires PNDT.', { recordSignature: record.signature })
  return exactNumericSubrecord(record, 'GNAM', 12, 'SYSTEM_NUMBER')
}

export function extractStdtSystemNumber(record) {
  if (record.signature !== 'STDT') throw new PluginReaderError('UNSUPPORTED_RECORD_SHAPE', 'Star matching requires STDT.', { recordSignature: record.signature })
  return exactNumericSubrecord(record, 'DNAM', 4, 'SYSTEM_NUMBER')
}

function compareBody(left, right) {
  return Number.parseInt(left.recordFormId, 16) - Number.parseInt(right.recordFormId, 16) ||
    left.recordSourcePlugin.localeCompare(right.recordSourcePlugin)
}

export function buildC3Targets(planetDirectoryCsv) {
  const bodyRows = parse(planetDirectoryCsv, { bom: true, columns: true, skip_empty_lines: true, trim: true })
  const systems = new Map()
  for (const row of bodyRows) {
    if (!row.StarSystemID || !row.SystemName || !row.SourceFile || !row.PlanetFormID) {
      throw new Error(`CANONICAL_SOURCE_ERROR: incomplete system identity on body ${row.PlanetFormID || '<unknown>'}.`)
    }
    const key = row.StarSystemID
    const existing = systems.get(key)
    if (existing && existing.canonicalEnglish !== row.SystemName) {
      throw new Error(`CANONICAL_SOURCE_ERROR: system ${key} has conflicting names ${JSON.stringify(existing.canonicalEnglish)} and ${JSON.stringify(row.SystemName)}.`)
    }
    const body = { recordSourcePlugin: row.SourceFile, recordFormId: row.PlanetFormID, recordSignature: 'PNDT' }
    if (!existing) systems.set(key, { entityKind: 'system', entityId: key, canonicalEnglish: row.SystemName, bodies: [body] })
    else if (!existing.bodies.some((item) => item.recordSourcePlugin === body.recordSourcePlugin && item.recordFormId === body.recordFormId)) existing.bodies.push(body)
  }
  const targets = [...systems.values()]
  for (const item of targets) item.bodies.sort(compareBody)
  targets.sort((left, right) => left.entityId.localeCompare(right.entityId))
  return {
    targets,
    statistics: {
      bodyRows: bodyRows.length,
      uniqueBodies: targets.reduce((total, item) => total + item.bodies.length, 0),
      canonicalSystems: targets.length,
      multiBodySystems: targets.filter((item) => item.bodies.length > 1).length,
    },
  }
}

export function indexStdtBySystemNumber(starRecordsByPlugin) {
  const index = new Map()
  for (const plugin of OFFICIAL_SYSTEM_PLUGINS) {
    for (const record of starRecordsByPlugin.get(plugin) ?? []) {
      const systemNumber = extractStdtSystemNumber(record)
      const match = { plugin, record }
      index.set(systemNumber, [...(index.get(systemNumber) ?? []), match])
    }
  }
  return index
}

function unresolved(item, source, reasonCode, detail) {
  return {
    EntityKind: 'system', EntityId: item.entityId,
    RecordSourcePlugin: source?.plugin ?? item.bodies[0]?.recordSourcePlugin ?? '',
    RecordFormID: source?.record?.formIdHex ?? item.bodies[0]?.recordFormId ?? '',
    RecordSignature: source?.record ? 'STDT' : 'PNDT', CanonicalEnglish: item.canonicalEnglish,
    ReasonCode: reasonCode, Detail: detail,
  }
}

export function generateSystemProvenance(targets, pndtRecordsByPlugin, starRecordsByPlugin, tablesByQualifiedKey, normalizationPolicy = new Map()) {
  const provenance = []
  const unresolvedRows = []
  const normalizations = []
  const stdtIndex = indexStdtBySystemNumber(starRecordsByPlugin)
  for (const item of targets) {
    const evidence = []
    let extractionFailure
    for (const body of item.bodies) {
      const record = pndtRecordsByPlugin.get(body.recordSourcePlugin)?.get(`PNDT:${body.recordFormId}`)
      if (!record) {
        extractionFailure = {
          reasonCode: 'SYSTEM_NUMBER_MISSING',
          detail: `Canonical body ${body.recordSourcePlugin} PNDT:${body.recordFormId} was not available.`,
        }
        break
      }
      try {
        evidence.push({ body, systemNumber: extractPndtSystemNumber(record) })
      } catch (error) {
        extractionFailure = {
          reasonCode: error.code === 'UNSUPPORTED_RECORD_SHAPE' ? 'UNSUPPORTED_RECORD_SHAPE' : 'SYSTEM_NUMBER_MISSING',
          detail: `${body.recordSourcePlugin} PNDT:${body.recordFormId}: ${error.message}`,
        }
        break
      }
    }
    if (extractionFailure || evidence.length === 0) {
      unresolvedRows.push(unresolved(
        item,
        undefined,
        extractionFailure?.reasonCode ?? 'SYSTEM_NUMBER_MISSING',
        extractionFailure?.detail ?? 'No PNDT system-number evidence was available.',
      ))
      continue
    }
    const numbers = new Set(evidence.map((entry) => entry.systemNumber))
    if (numbers.size !== 1) {
      const detail = evidence.map((entry) => `${entry.body.recordSourcePlugin} PNDT:${entry.body.recordFormId}=${entry.systemNumber}`).join(', ')
      unresolvedRows.push(unresolved(item, undefined, 'SYSTEM_NUMBER_CONFLICT', detail))
      continue
    }
    const systemNumber = evidence[0].systemNumber
    const matches = stdtIndex.get(systemNumber) ?? []
    if (matches.length === 0) {
      unresolvedRows.push(unresolved(item, undefined, 'SYSTEM_STDT_NOT_FOUND', `No STDT.DNAM matched system number ${systemNumber}.`))
      continue
    }
    if (matches.length !== 1) {
      const detail = matches.map((match) => `${match.plugin} STDT:${match.record.formIdHex}`).join(', ')
      unresolvedRows.push(unresolved(item, undefined, 'SYSTEM_STDT_AMBIGUOUS', `System number ${systemNumber} matched ${detail}.`))
      continue
    }
    const match = matches[0]
    let localized
    try {
      localized = extractLocalizedId(match.record, SEMANTIC_PATHS.TES_FULL_NAME)
    } catch (error) {
      unresolvedRows.push(unresolved(item, match, 'UNSUPPORTED_RECORD_SHAPE', error.message))
      continue
    }
    const row = {
      EntityKind: 'system', EntityId: item.entityId, DisplayNameSourceKind: 'direct', ComponentOrder: '0', ComponentRole: 'complete',
      RecordSourcePlugin: match.plugin, RecordFormID: match.record.formIdHex, RecordSignature: 'STDT',
      NameFieldPath: SEMANTIC_PATHS.TES_FULL_NAME, NameSourcePlugin: match.plugin,
      NameStringTable: localized.stringTable, NameStringID: localized.idHex, CanonicalEnglish: item.canonicalEnglish,
    }
    const verification = verifyEnglish(row, tablesByQualifiedKey.get(`${match.plugin}:${localized.stringTable}`), normalizationPolicy)
    if (verification.reasonCode) {
      const code = verification.reasonCode === 'CANONICAL_SOURCE_ERROR' ? 'SYSTEM_NAME_MISMATCH' : verification.reasonCode
      unresolvedRows.push(unresolved(item, match, code, `System number ${systemNumber}; extracted ${localized.stringTable}:${localized.idHex}; ${verification.detail}`))
    } else {
      provenance.push(row)
      if (verification.classification) normalizations.push({
        EntityKind: row.EntityKind, EntityId: row.EntityId, ExpectedSourceEnglish: row.CanonicalEnglish,
        ExpectedLocalizedEnglish: verification.value, ReasonCode: verification.classification, Detail: verification.detail ?? '',
      })
    }
  }
  provenance.sort((left, right) => left.EntityId.localeCompare(right.EntityId))
  unresolvedRows.sort((left, right) => left.EntityId.localeCompare(right.EntityId))
  return { provenance, unresolved: unresolvedRows, normalizations, stdtIndex }
}
