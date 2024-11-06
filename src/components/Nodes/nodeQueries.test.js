import { calcNodeResources } from './nodeQueries.js';
// TODO: Values as string and as numbers
describe('Calculate resources for node', () => {
  it.each([
    {
      name: 'Pods with one container and values as string',
      pods: {
        items: [
          fixPod([fixResources('7m', '70Mi', '14m', '140Mi')]),
          fixPod([fixResources('3m', '30Mi', '6m', '60Mi')]),
        ],
      },
      expectedValue: {
        limits: {
          cpu: '10m',
          memory: '100.00Mi',
        },
        requests: {
          cpu: '20m',
          memory: '200.00Mi',
        },
      },
    },
    {
      name: 'Pods with two containers and values as string',
      pods: {
        items: [
          fixPod([fixResources('7m', '70Mi', '14m', '140Mi')]),
          fixPod([
            fixResources('3m', '30Mi', '6m', '60Mi'),
            fixResources('5m', '50Mi', '11m', '110Mi'),
          ]),
        ],
      },
      expectedValue: {
        limits: {
          cpu: '15m',
          memory: '150.00Mi',
        },
        requests: {
          cpu: '31m',
          memory: '310.00Mi',
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
          cpu: '7m',
          memory: '70.00Mi',
        },
        requests: {
          cpu: '14m',
          memory: '140.00Mi',
        },
      },
    },
  ])('Values as string', tc => {
    //WHEN
    const resources = calcNodeResources(tc.pods);

    //THEN
    expect(resources).toStrictEqual(tc.expectedValue);
  });

  // test('Pods with one container and values as string', () => {
  //   //GIVEN
  //   const expectedValue = {
  //     limits: {
  //       cpu: '10m',
  //       memory: '100.00Mi',
  //     },
  //     requests: {
  //       cpu: '20m',
  //       memory: '200.00Mi',
  //     },
  //   };
  //   const pods = {
  //     items: [
  //       fixPod(fixResources('7m', '70Mi', '14m', '140Mi')),
  //       fixPod(fixResources('3m', '30Mi', '6m', '60Mi')),
  //     ],
  //   };
  //   //WHEN
  //   const resources = calcNodeResources(pods);
  //
  //   //THEN
  //   expect(resources).toStrictEqual(expectedValue);
  // });
});

function fixPod(resources) {
  return {
    spec: {
      containers: resources.map(item => {
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

// TODO: REMOVE IT
describe('A', () => {
  test('B', () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const result = data.reduce((acc, item) => {
      const bb = acc + item;
      return bb;
    });

    console.log(result);
  });
});
