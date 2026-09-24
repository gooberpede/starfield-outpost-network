/** Application identity is build metadata, never persisted network state. */
export interface BuildIdentity {
  version: string
  commit: string | null
  status: 'clean' | 'modified' | 'unknown'
  sourceUrl: string | null
}

declare const __BUILD_IDENTITY__: BuildIdentity

export const buildIdentity: Readonly<BuildIdentity> = __BUILD_IDENTITY__
