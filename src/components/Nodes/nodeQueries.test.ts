import { describe, expect, vi, it, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { calcNodeResources, useNodesQuery } from './nodeQueries';

const mockUseGet = vi.hoisted(() => vi.fn());

vi.mock('shared/hooks/BackendAPI/useGet', () => ({ useGet: mockUseGet }));

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

const MiB = 1024 * 1024;

interface ResourceSpec {
  limits: { cpu: string; memory: string };
  requests: { cpu: string; memory: string };
}

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
          memory: 100.0 * MiB,
        },
        requests: {
          cpu: 0.02,
          memory: 200.0 * MiB,
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
          memory: 220.0 * MiB,
        },
        requests: {
          cpu: 0.045,
          memory: 450.0 * MiB,
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
          memory: 70.0 * MiB,
        },
        requests: {
          cpu: 0.014,
          memory: 140.0 * MiB,
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

function fixPod(resources: ResourceSpec[]) {
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

function fixResources(
  cpuLimit: string,
  memoryLimit: string,
  cpuRequest: string,
  memoryRequest: string,
): ResourceSpec {
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

const node = {
  metadata: { name: 'test-node' },
  status: { allocatable: { cpu: '1000m', memory: '1Gi' } },
};

const runningPod = {
  metadata: { name: 'running-pod' },
  spec: {
    nodeName: 'test-node',
    containers: [{ resources: { requests: { cpu: '500m', memory: '128Mi' } } }],
  },
  status: { phase: 'Running' },
};

const succeededPod = {
  metadata: { name: 'succeeded-pod' },
  spec: {
    nodeName: 'test-node',
    containers: [{ resources: { requests: { cpu: '500m', memory: '128Mi' } } }],
  },
  status: { phase: 'Succeeded' },
};

const failedPod = {
  metadata: { name: 'failed-pod' },
  spec: {
    nodeName: 'test-node',
    containers: [{ resources: { requests: { cpu: '500m', memory: '128Mi' } } }],
  },
  status: { phase: 'Failed' },
};

describe('useNodesQuery request numbers', () => {
  beforeEach(() => {
    mockUseGet.mockImplementation((url: string) => {
      if (url === '/api/v1/nodes') {
        return { data: { items: [node] }, loading: false, error: null };
      }
      if (url === '/api/v1/pods') {
        return { data: null, loading: true, error: null };
      }
      return { data: null, loading: false, error: null };
    });
  });

  it('request values are null while pods are still loading', () => {
    const { result } = renderHook(() => useNodesQuery());
    expect(result.current.nodes?.[0].metrics.cpu.requestValue).toBeNull();
    expect(result.current.nodes?.[0].metrics.memory.requestValue).toBeNull();
  });

  it('request values are computed once pods arrive', () => {
    mockUseGet.mockImplementation((url: string) => {
      if (url === '/api/v1/nodes') {
        return { data: { items: [node] }, loading: false, error: null };
      }
      if (url === '/api/v1/pods') {
        return { data: { items: [runningPod] }, loading: false, error: null };
      }
      return { data: null, loading: false, error: null };
    });

    const { result } = renderHook(() => useNodesQuery());
    expect(result.current.nodes?.[0].metrics.cpu.requestValue).toBe(50);
  });

  it('Succeeded and Failed pods do not contribute to request values', () => {
    mockUseGet.mockImplementation((url: string) => {
      if (url === '/api/v1/nodes') {
        return { data: { items: [node] }, loading: false, error: null };
      }
      if (url === '/api/v1/pods') {
        return {
          data: { items: [runningPod, succeededPod, failedPod] },
          loading: false,
          error: null,
        };
      }
      return { data: null, loading: false, error: null };
    });

    const { result } = renderHook(() => useNodesQuery());
    // Only runningPod (500m / 1000m = 50%) should count
    expect(result.current.nodes?.[0].metrics.cpu.requestValue).toBe(50);
  });
});
