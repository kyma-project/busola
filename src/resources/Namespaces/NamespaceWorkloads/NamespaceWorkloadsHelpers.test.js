import { getAvailableGPUs } from 'resources/Namespaces/NamespaceWorkloads/NamespaceWorkloadsHelpers';

describe('GPU counter tests', () => {
  test('Available GPUs is 0', () => {
    const nodes = [fixNode(), fixNode(), fixNode()];

    const gpusNumber = getAvailableGPUs(nodes);
    expect(gpusNumber).toEqual(0);
  });

  test('Available GPUs is 2 on 2 different nodes', () => {
    const nodes = [
      fixNode(),
      fixNode(),
      fixGPUNode(1),
      fixNode(),
      fixGPUNode(1),
      fixNode(),
    ];

    const gpusNumber = getAvailableGPUs(nodes);
    expect(gpusNumber).toEqual(2);
  });
});

function fixGPUNode(gpuCount) {
  return {
    status: {
      allocatable: {
        'nvidia.com/gpu': gpuCount,
      },
    },
  };
}

function fixNode() {
  return {
    status: {
      allocatable: {},
    },
  };
}
