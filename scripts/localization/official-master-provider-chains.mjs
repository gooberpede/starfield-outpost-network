/**
 * Purpose: Resolve localized fields across the tracker's three official full-module providers.
 * Architecture: TES4 master-relative identity is normalized before deterministic provider selection.
 * Change this file when: The authoritative official-master boundary or full-module provider rule changes.
 */
import fs from 'node:fs'

import { extractLocalizedId } from './localized-field-map.mjs'
import { decodeRecordHeader, decodeSubrecords, formatHex32, PluginReaderError, RECORD_HEADER_SIZE } from './starfield-plugin-reader.mjs'

export const AUTHORITATIVE_LOCALIZATION_PLUGINS = Object.freeze([
  'Starfield.esm', 'ShatteredSpace.esm', 'SFBGS00D.esm',
])

function canonicalPluginName(value) {
  return AUTHORITATIVE_LOCALIZATION_PLUGINS.find((plugin) => plugin.toLowerCase() === value.toLowerCase()) ?? value
}

/** Read only the ordered MAST entries required to decode ordinary full-module FormIDs. */
export function readTes4MasterList(pluginPath) {
  const fd = fs.openSync(pluginPath, fs.constants.O_RDONLY)
  try {
    const headerBuffer = Buffer.alloc(RECORD_HEADER_SIZE)
    if (fs.readSync(fd, headerBuffer, 0, headerBuffer.length, 0) !== headerBuffer.length) {
      throw new PluginReaderError('PLUGIN_TRUNCATED', 'TES4 header is incomplete.', { plugin: pluginPath })
    }
    const header = decodeRecordHeader(headerBuffer)
    if (header.kind !== 'record' || header.signature !== 'TES4') {
      throw new PluginReaderError('TES4_HEADER_MISSING', 'The plugin does not begin with a TES4 record.', { plugin: pluginPath })
    }
    const payload = Buffer.alloc(header.dataSize)
    if (fs.readSync(fd, payload, 0, payload.length, RECORD_HEADER_SIZE) !== payload.length) {
      throw new PluginReaderError('PLUGIN_TRUNCATED', 'TES4 payload is incomplete.', { plugin: pluginPath })
    }
    return decodeSubrecords(payload, { plugin: pluginPath, recordSignature: 'TES4' })
      .filter((subrecord) => subrecord.signature === 'MAST')
      .map((subrecord) => canonicalPluginName(subrecord.data.toString('utf8').replace(/\0+$/, '')))
  } finally {
    fs.closeSync(fd)
  }
}

export function normalizeFullModuleRecordIdentity(plugin, masters, recordSignature, formId) {
  const namespaces = [...masters.map(canonicalPluginName), canonicalPluginName(plugin)]
  const namespaceIndex = (formId >>> 24) & 0xFF
  const originPlugin = namespaces[namespaceIndex]
  if (!originPlugin) {
    throw new PluginReaderError('FORM_ID_NORMALIZATION_FAILED', `Full-module namespace index ${namespaceIndex} is out of range.`, {
      plugin, masters, recordSignature, formId: formatHex32(formId),
    })
  }
  const objectId = formId & 0x00FFFFFF
  return {
    recordSignature, originPlugin, objectId, objectIdHex: objectId.toString(16).toUpperCase().padStart(6, '0'),
    key: `${recordSignature}:${originPlugin}:${objectId}`,
  }
}

/** Build chains only from the explicitly ordered authoritative official masters. */
export function buildSupportedProviderChains(pluginInputs) {
  const byPlugin = new Map(pluginInputs.map((input) => [input.plugin, input]))
  const chains = new Map()
  for (const plugin of AUTHORITATIVE_LOCALIZATION_PLUGINS) {
    const input = byPlugin.get(plugin)
    if (!input) throw new PluginReaderError('SUPPORTED_PLUGIN_MISSING', `Required provider input ${plugin} is missing.`)
    for (const record of input.records) {
      const identity = normalizeFullModuleRecordIdentity(plugin, input.masters, record.signature, record.formId)
      const provider = { plugin, record, identity }
      const chain = chains.get(identity.key) ?? []
      if (chain.some((item) => item.plugin === plugin)) {
        throw new PluginReaderError('PROVIDER_CHAIN_AMBIGUOUS', `Multiple ${plugin} records normalize to ${identity.key}.`, {
          plugin, recordSignature: record.signature, formId: record.formIdHex,
        })
      }
      chains.set(identity.key, [...chain, provider])
    }
  }
  return chains
}

export function logicalIdentityForRecord(plugin, mastersByPlugin, recordSignature, formId) {
  const masters = mastersByPlugin.get(plugin)
  if (!masters) throw new PluginReaderError('SUPPORTED_PLUGIN_MISSING', `No TES4 master list is available for ${plugin}.`)
  return normalizeFullModuleRecordIdentity(plugin, masters, recordSignature, formId)
}

/** The winner owns the field when it serializes the exact path; otherwise walk backward. */
export function resolveLocalizedFieldProvider(chain, semanticPath) {
  if (!chain?.length) throw new PluginReaderError('OVERRIDE_PROVIDER_UNRESOLVED', 'No provider chain was available.', { semanticPath })
  for (let index = chain.length - 1; index >= 0; index -= 1) {
    const provider = chain[index]
    try {
      return { ...provider, localized: extractLocalizedId(provider.record, semanticPath), inherited: index !== chain.length - 1 }
    } catch (error) {
      if (error?.code !== 'SEMANTIC_FIELD_NOT_FOUND') throw error
    }
  }
  throw new PluginReaderError('OVERRIDE_PROVIDER_UNRESOLVED', 'No provider explicitly serializes the selected semantic field.', {
    semanticPath, providers: chain.map((provider) => provider.plugin),
  })
}
