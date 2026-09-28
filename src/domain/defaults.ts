/**
 * Purpose:
 *   Define persisted initial network values and deterministic automatic names.
 *
 * Architecture:
 *   Owns product defaults for newly created domain objects. It does not infer
 *   values from reference data or presentation state.
 *
 * Change this file when:
 *   New-network defaults or automatic outpost naming policy changes.
 */
import type {
  Outpost,
  OutpostNetwork,
} from './models'

export const createDefaultNetwork = (): OutpostNetwork => ({
  schemaVersion: 4,

  character: {
    name: '',
    level: null,

    skills: {
      outpostManagement: null,
      outpostEngineering: null,
      planetaryHabitation: null,
      researchMethods: null,
      specialProjects: null,
    },
    capabilities: {
      // X-Tech is enabled product policy; unlike unknown skill ranks, it is not unrecorded data.
      xTechExtraction: true,
    },
  },

  outposts: [],
  cargoLinks: [],
})

/**
 * Returns the first unused automatic outpost name.
 *
 * The unsuffixed name is preferred. If it is already in use, numbered names
 * are tried in ascending order so gaps left by deleted or renamed outposts can
 * be reused.
 *
 * Examples:
 *   New Outpost
 *   New Outpost (2)
 *   New Outpost (3)
 */
function getDefaultOutpostName(
  existingOutposts: Outpost[],
  baseName = 'New Outpost',
): string {
  const existingNames =
    new Set(
      existingOutposts.map(
        (outpost) => outpost.name,
      ),
    )

  if (!existingNames.has(baseName)) {
    return baseName
  }

  let suffix = 2

  while (
    existingNames.has(
      `${baseName} (${suffix})`,
    )
  ) {
    suffix += 1
  }

  return `${baseName} (${suffix})`
}

/**
 * Creates a blank outpost with a unique automatic name.
 *
 * Existing outposts are supplied only for default-name selection; all other
 * initial outpost state is independent of the current network.
 */
export const createDefaultOutpost = (
  existingOutposts: Outpost[] = [],
  id: string = crypto.randomUUID(),
  baseName = 'New Outpost',
): Outpost => ({
  id,
  name: getDefaultOutpostName(
    existingOutposts,
    baseName,
  ),
  systemId: '',
  bodyId: '',
  selectedBiomeIds: [],
  localResources: [],
  explicitResourcePresence: [],
  activeProduction: [],
  manufacturing: [],
  plannedSupply: [],
  cargoPads: [],
})
