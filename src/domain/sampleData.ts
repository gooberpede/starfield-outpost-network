import type { OutpostNetwork } from './models'

export const sampleNetwork: OutpostNetwork = {
  schemaVersion: 3,

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

    outposts: [
        {
            id: 'outpost-feynman-vi-b-001',
            name: 'Feynman VI-b Al Be He3',
            systemId: 'feynman',
            bodyId: 'feynman-vi-b',
            selectedBiomeIds: [],
            localResources: [
              'helium-3',
              'aluminium',
              'beryllium',
            ],
            activeProduction: [
              { type: 'inorganic', resourceId: 'helium-3' },
              { type: 'inorganic', resourceId: 'aluminium' },
              { type: 'inorganic', resourceId: 'beryllium' },
            ],
            manufacturing: [
              {
                productId: 'tau-grade-rheostat',
                quantity: 2,
              },
              {
                productId: 'reactive-gauge',
                quantity: 1,
              },
              {
                productId: 'positron-battery',
                quantity: 1,
              },
            ],
            plannedSupply: [],
            cargoPads: [],
        },
        {
            id: 'outpost-feynman-i-001',
            name: 'Feynman I Li Cu xF4',
            systemId: 'feynman',
            bodyId: 'feynman-i',
            selectedBiomeIds: [],
            localResources: [],
            activeProduction: [],
            manufacturing: [],
            plannedSupply: [],
            cargoPads: [],
        },
    ],
    cargoLinks: [],
}
