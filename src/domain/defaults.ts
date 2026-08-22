import type {
  Outpost,
  OutpostNetwork,
} from './models'

export const createDefaultNetwork = (): OutpostNetwork => ({
  schemaVersion: 2,

  character: {
    name: '',
    level: 1,

    skills: {
      outpostManagement: 0,
      outpostEngineering: 0,
      planetaryHabitation: 0,
      researchMethods: 0,
      specialProjects: 0,
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