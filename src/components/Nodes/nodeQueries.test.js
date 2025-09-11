import { calcNodeResources } from './nodeQueries.js';

vi.mock('shared/components/UI5RadialChart/UI5RadialChart', () => {
  return {
    default: () => ({}),
  };
});

vi.mock('@ui5/webcomponents-react', () => {
  return {
    Spinner: () => ({}),
  };
});

describe('Calculate resources for node', () => {
  const testCases = [
    {
      name: 'Pods with one container',
      pods: {
        items: [
          fixPod([fixResources('7m', '70Mi', '14m', '140Mi')]),
          fixPod([fixResources('3m', '30Mi', '6m', '60Mi')]),
        ],
      },
      expectedValue: {
        limits: {
          cpu: 0.01,
          memory: 100.0 / 1024,
        },
        requests: {
          cpu: 0.02,
          memory: 200.0 / 1024,
        },
      },
    },
    {
      name: 'Pods with two containers',
      pods: {
        items: [
          fixPod([
            fixResources('7m', '70Mi', '14m', '140Mi'),
            fixResources('7m', '70Mi', '14m', '140Mi'),
          ]),
          fixPod([
            fixResources('3m', '30Mi', '6m', '60Mi'),
            fixResources('5m', '50Mi', '11m', '110Mi'),
          ]),
        ],
      },
      expectedValue: {
        limits: {
          cpu: 0.022,
          memory: 220.0 / 1024,
        },
        requests: {
          cpu: 0.045,
          memory: 450.0 / 1024,
        },
      },
    },
    {
      name: 'Pods container and one without resources',
      pods: {
        items: [
          fixPod([fixResources('7m', '70Mi', '14m', '140Mi')]),
          fixPodWithoutResources(),
        ],
      },
      expectedValue: {
        limits: {
          cpu: 0.007,
          memory: 70.0 / 1024,
        },
        requests: {
          cpu: 0.014,
          memory: 140.0 / 1024,
        },
      },
    },
  ];

  testCases.forEach((tc) => {
    test(tc.name, () => {
      //WHEN
      const resources = calcNodeResources(tc.pods);

      //THEN
      expect(resources).toStrictEqual(tc.expectedValue);
    });
  });
});

function fixPod(resources) {
  return {
    spec: {
      containers: resources.map((item) => {
        return {
          resources: item,
        };
      }),
    },
  };
}

function fixPodWithoutResources() {
  return {
    spec: {
      containers: [
        {
          resources: {},
        },
      ],
    },
  };
}

function fixResources(cpuLimit, memoryLimit, cpuRequest, memoryRequest) {
  return {
    limits: {
      cpu: cpuLimit,
      memory: memoryLimit,
    },
    requests: {
      cpu: cpuRequest,
      memory: memoryRequest,
    },
  };
}
