export type ImportErrorCode =
  | 'invalid-collection'
  | 'empty-collection'
  | 'malformed-network-entry'
  | 'unsupported-collection-schema'
  | 'unsupported-network-schema'
  | 'invalid-structure'
  | 'invalid-identity'

export type ImportErrorParameters = Record<string, string | number>

/** Locale-neutral failure returned by the external-file trust boundary. */
export class NetworkImportError extends Error {
  readonly code: ImportErrorCode
  readonly parameters: ImportErrorParameters

  constructor(
    code: ImportErrorCode,
    parameters: ImportErrorParameters = {},
  ) {
    super(code)
    this.name = 'NetworkImportError'
    this.code = code
    this.parameters = parameters
  }
}
