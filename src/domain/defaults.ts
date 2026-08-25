import type {
  Outpost,
  OutpostNetwork,
} from './models'

export const createDefaultNetwork = (): OutpostNetwork => ({
  schemaVersion: 2,

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
  },

  outposts: [],
  cargoLinks: [],
})

export const createDefaultOutpost = (): Outpost => ({
  id: crypto.randomUUID(),
  name: 'New Outpost',
  systemId: '',
  bodyId: '',
  localResources: [],
  activeProduction: [],
  manufacturing: [],
  plannedSupply: [],
  cargoPads: [],
})