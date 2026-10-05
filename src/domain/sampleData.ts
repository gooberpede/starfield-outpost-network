import type { OutpostNetwork } from './models'

export const sampleNetwork: OutpostNetwork = {
  schemaVersion: 5,

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
    capabilities: { xTechExtraction: true },
  },

  outposts: [
    {
      id: 'outpost-feynman-vi-b-001',
      name: 'Feynman VI-b Al Be He3',
      systemId: '86469',
      bodyId: '0005E0E3',
      selectedBiomeIds: [],
      localResources: [
        'helium-3',
        'aluminium',
        'beryllium',
      ],
      explicitResourcePresence: [],
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
      cargoPads: [
        {
          id: 'pad-feynman-vi-b-001',
          label: 'Cargo Link 1',
          type: 'regular',
          outboundItems: [
            { type: 'resource', id: 'aluminium' },
          ],
        },
      ],
    },
    {
      id: 'outpost-feynman-i-001',
      name: 'Feynman I Li Cu xF4',
      systemId: '86469',
      bodyId: '0005E0DA',
      selectedBiomeIds: [],
      localResources: [],
      explicitResourcePresence: [],
      activeProduction: [],
      manufacturing: [],
      plannedSupply: [
        { type: 'resource', id: 'aluminium' },
      ],
      cargoPads: [
        {
          id: 'pad-feynman-i-001',
          label: 'Cargo Link 1',
          type: 'regular',
          outboundItems: [],
        },
      ],
    },
  ],
  cargoLinks: [
    {
      id: 'link-feynman-001',
      endpointA: {
        outpostId: 'outpost-feynman-vi-b-001',
        cargoPadId: 'pad-feynman-vi-b-001',
      },
      endpointB: {
        outpostId: 'outpost-feynman-i-001',
        cargoPadId: 'pad-feynman-i-001',
      },
    },
  ],
}
