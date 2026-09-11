import type { MessageDescriptor } from '../localization/types.ts'

export interface ImportFailurePresentation {
  reason: MessageDescriptor
  diagnostic?: string
}

/** Maps expected deserialization failures to stable presentation codes. */
export function getImportFailurePresentation(error: unknown): ImportFailurePresentation {
  const diagnostic = error instanceof Error ? error.message : String(error)
  if (error instanceof SyntaxError) return {
    reason: { key: 'status.import.invalidJson' },
    diagnostic,
  }
  const collectionVersion = diagnostic.match(/^Unsupported network collection schema version: (.+)$/)
  if (collectionVersion) return {
    reason: { key: 'status.import.unsupportedCollectionSchema', parameters: { version: collectionVersion[1] } },
    diagnostic,
  }
  const networkVersion = diagnostic.match(/^Unsupported network schema version: (.+)$/)
  if (networkVersion) return {
    reason: { key: 'status.import.unsupportedNetworkSchema', parameters: { version: networkVersion[1] } },
    diagnostic,
  }
  const duplicateId = diagnostic.match(/^The selected collection contains duplicate network ID "(.+)"\.$/)
  if (duplicateId) return {
    reason: { key: 'status.import.duplicateNetworkId', parameters: { id: duplicateId[1] } },
    diagnostic,
  }
  const known = new Map<string, MessageDescriptor['key']>([
    ['The selected file is not a valid network collection.', 'status.import.invalidCollection'],
    ['The selected collection does not contain any networks.', 'status.import.emptyCollection'],
    ['The selected collection contains a malformed network entry.', 'status.import.malformedEntry'],
    ['The selected file contains invalid character data.', 'status.import.invalidCharacter'],
    ['The selected file contains invalid character capability data.', 'status.import.invalidCapabilities'],
    ['The selected file contains invalid character skill data.', 'status.import.invalidSkills'],
    ['The selected file is not a valid outpost network.', 'status.import.invalidNetwork'],
    ['The selected file contains an invalid outpost.', 'status.import.invalidOutpost'],
    ['The selected file contains invalid explicit resource presence data.', 'status.import.invalidExplicitPresence'],
    ['The selected file contains an invalid cargo pad.', 'status.import.invalidCargoPad'],
  ])
  const key = known.get(diagnostic)
  return {
    reason: { key: key ?? 'status.import.invalid' },
    diagnostic,
  }
}
