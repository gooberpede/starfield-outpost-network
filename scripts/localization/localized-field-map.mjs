/** Project-owned allowlist translating semantic name fields into serialized table identity. */
import { PluginReaderError, formatHex32 } from './starfield-plugin-reader.mjs'

export const SEMANTIC_PATHS = Object.freeze({
  TOP_LEVEL_FULL: 'topLevel.FULL',
  TES_FULL_NAME: 'baseFormComponents.TESFullName_Component.fullName.FULL',
})

const definitions = [
  { recordSignature: 'IRES', semanticPath: SEMANTIC_PATHS.TOP_LEVEL_FULL, stringTable: 'strings', selector: { kind: 'topLevel', signature: 'FULL' } },
  { recordSignature: 'BIOM', semanticPath: SEMANTIC_PATHS.TOP_LEVEL_FULL, stringTable: 'strings', selector: { kind: 'topLevel', signature: 'FULL' } },
  // PERK records can contain later rank FULL fields; only the top-level skill label is a C2 name.
  { recordSignature: 'PERK', semanticPath: SEMANTIC_PATHS.TOP_LEVEL_FULL, stringTable: 'strings', selector: { kind: 'topLevelBefore', signature: 'FULL', boundarySignature: 'PRRK' } },
  { recordSignature: 'STDT', semanticPath: SEMANTIC_PATHS.TES_FULL_NAME, stringTable: 'strings', selector: { kind: 'component', componentMarker: 'TESFullName_Component', signature: 'FULL' } },
  { recordSignature: 'PNDT', semanticPath: SEMANTIC_PATHS.TES_FULL_NAME, stringTable: 'strings', selector: { kind: 'component', componentMarker: 'TESFullName_Component', signature: 'FULL' } },
]

export const LOCALIZED_FIELD_DEFINITIONS = Object.freeze(definitions.map((definition) => Object.freeze(definition)))

export function getLocalizedFieldDefinition(recordSignature, semanticPath) {
  const signatureDefinitions = LOCALIZED_FIELD_DEFINITIONS.filter((item) => item.recordSignature === recordSignature)
  if (signatureDefinitions.length === 0) {
    throw new PluginReaderError('UNSUPPORTED_RECORD_SIGNATURE', `No localized fields are allowlisted for ${recordSignature}.`, {
      recordSignature, semanticPath,
    })
  }
  const matches = signatureDefinitions.filter((item) => item.semanticPath === semanticPath)
  if (matches.length !== 1) {
    throw new PluginReaderError('UNSUPPORTED_SEMANTIC_PATH', `Semantic path ${semanticPath} is not allowlisted for ${recordSignature}.`, {
      recordSignature, semanticPath,
    })
  }
  return matches[0]
}

function componentName(subrecord) {
  return subrecord.data.toString('utf8').replace(/\0+$/, '')
}

function selectSemanticCandidates(subrecords, selector, context) {
  const candidates = []
  let openComponent = null
  for (const subrecord of subrecords) {
    if (selector.kind === 'topLevelBefore' && subrecord.signature === selector.boundarySignature) break
    if (subrecord.signature === 'BFCB') {
      if (openComponent !== null) {
        throw new PluginReaderError('SEMANTIC_FIELD_AMBIGUOUS', 'Nested or unterminated base-form component markers are unsupported.', context)
      }
      openComponent = componentName(subrecord)
      continue
    }
    if (subrecord.signature === 'BFCE') {
      openComponent = null
      continue
    }
    if (subrecord.signature !== selector.signature) continue
    if (selector.kind === 'topLevel' && openComponent === null) candidates.push(subrecord)
    if (selector.kind === 'topLevelBefore' && openComponent === null) candidates.push(subrecord)
    if (selector.kind === 'component' && openComponent === selector.componentMarker) candidates.push(subrecord)
  }
  return candidates
}

export function extractLocalizedId(record, semanticPath) {
  const definition = getLocalizedFieldDefinition(record.signature, semanticPath)
  const context = { recordSignature: record.signature, formId: record.formIdHex, semanticPath }
  const candidates = selectSemanticCandidates(record.subrecords, definition.selector, context)
  if (candidates.length === 0) {
    throw new PluginReaderError('SEMANTIC_FIELD_NOT_FOUND', 'The allowlisted semantic field was not present.', context)
  }
  if (candidates.length !== 1) {
    throw new PluginReaderError('SEMANTIC_FIELD_AMBIGUOUS', 'The allowlisted semantic field occurred more than once.', context)
  }
  const field = candidates[0]
  if (field.data.length !== 4) {
    throw new PluginReaderError('LOCALIZED_ID_INVALID_LENGTH', `Localized ID payload is ${field.data.length} bytes; expected 4.`, context)
  }
  const id = field.data.readUInt32LE(0) >>> 0
  return { id, idHex: formatHex32(id), stringTable: definition.stringTable, semanticPath: definition.semanticPath }
}
