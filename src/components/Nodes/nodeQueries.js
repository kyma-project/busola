import { useEffect, useMemo, useState } from 'react';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import {
  getBytes,
  getCpus,
} from '../../resources/Namespaces/ResourcesUsage.js';

const round = (num, places) =>
  Math.round((num + Number.EPSILON) * Math.pow(10, places)) /
  Math.pow(10, places);

const getPercentageFromUsage = (value, total) => {
  if (total === 0) {
    return 'Unknown';
  }
  return Math.round((100 * value) / total);
};

const formatKiToGiMemory = memoryStr =>
  round(parseInt(memoryStr || '0') / 1024 / 1024, 1);

export const createUsageMetrics = (node, metricsForNode) => {
  const cpuUsage = getCpus(metricsForNode?.usage.cpu);
  const memoryUsage = formatKiToGiMemory(metricsForNode?.usage.memory);
  const cpuCapacity = getCpus(node.status.allocatable?.cpu || '0');
  const memoryCapacity = formatKiToGiMemory(node.status.allocatable?.memory);

  const cpuPercentage = getPercentageFromUsage(cpuUsage, cpuCapacity);
  const memoryPercentage = getPercentageFromUsage(memoryUsage, memoryCapacity);

  return {
    cpu: {
      usage: cpuUsage,
      capacity: cpuCapacity,
      percentage: cpuPercentage + '%',
      percentageValue: cpuPercentage,
    },
    memory: {
      usage: memoryUsage,
      capacity: memoryCapacity,
      percentage: memoryPercentage + '%',
      percentageValue: memoryPercentage,
    },
  };
};

export function useNodesQuery(skip = false) {
  const [data, setData] = useState(null);
  const { data: nodeMetrics, loading: metricsLoading } = useGet(
    '/apis/metrics.k8s.io/v1beta1/nodes',
    {
      pollingInterval: 4000,
      skip,
      compareEntireResource: true,
    },
  );

  const {
    data: nodes,
    error: nodesError,
    loading: nodesLoading,
  } = useGet('/api/v1/nodes', { pollingInterval: 5500, skip });

  useEffect(() => {
    if (nodes) {
      const getNodeMetrics = node => {
        const metricsForNode = nodeMetrics.items.find(
          metrics => node.metadata.name === metrics.metadata.name,
        );
        return createUsageMetrics(node, metricsForNode);
      };

      setData(
        nodes.items?.map(n => ({
          ...n,
          metrics: nodeMetrics ? getNodeMetrics(n) : {},
        })),
      );
    }
  }, [nodes, nodeMetrics]);

  return {
    nodes: data,
    error: nodesError,
    loading: metricsLoading || nodesLoading,
  };
}

export function useNodeQuery(nodeName) {
  const [data, setData] = useState(null);
  const {
    data: nodeMetrics,
    error: metricsError,
    loading: metricsLoading,
  } = useGet(`/apis/metrics.k8s.io/v1beta1/nodes/${nodeName}`, {
    pollingInterval: 3000,
  });

  const {
    data: node,
    error: nodeError,
    loading: nodeLoading,
  } = useGet(`/api/v1/nodes/${nodeName}`, { pollingInterval: 3000 });

  useEffect(() => {
    if (node) {
      setData({
        node,
        metrics: nodeMetrics ? createUsageMetrics(node, nodeMetrics) : {},
      });
    }
  }, [node, nodeMetrics]);

  return {
    data,
    error: metricsError || nodeError,
    loading: metricsLoading || nodeLoading,
  };
}

const emptyResources = {
  limits: {
    cpu: 0,
    memory: 0,
  },
  requests: {
    cpu: 0,
    memory: 0,
  },
};

function addResources(a, b) {
  if (!a) {
    if (!b) {
      return structuredClone(emptyResources);
    }
    return b;
  }
  if (!b) {
    if (!a) {
      return structuredClone(emptyResources);
    }
    return a;
  }
  return {
    limits: {
      cpu: getCpus(a?.limits?.cpu) + getCpus(b?.limits?.cpu),
      memory: getBytes(a?.limits?.memory) + getBytes(b?.limits?.memory),
    },
    requests: {
      cpu: getCpus(a?.requests?.cpu) + getCpus(b?.requests?.cpu),
      memory: getBytes(a?.requests?.memory) + getBytes(b?.requests?.memory),
    },
  };
}

function sumContainersResources(containers) {
  return containers?.reduce((containerAccu, container) => {
    const containerResources = container.resources;
    const updatedResources = addResources(containerAccu, containerResources);
    return updatedResources;
  }, structuredClone(emptyResources));
}

export function calcNodeResources(pods) {
  const nodeResources =
    pods?.items?.reduce((accumulator, pod) => {
      if (pod?.spec?.containers) {
        const containerResources = sumContainersResources(
          pod?.spec?.containers,
        );
        return addResources(accumulator, containerResources);
      }
      return accumulator;
    }, structuredClone(emptyResources)) || structuredClone(emptyResources);

  return {
    limits: {
      cpu: nodeResources.limits.cpu,
      memory: nodeResources.limits.memory / Math.pow(1024, 3),
    },
    requests: {
      cpu: nodeResources.requests.cpu,
      memory: nodeResources.requests.memory / Math.pow(1024, 3),
    },
  };
}

export function useResourceByNode(nodeName) {
  const [data, setData] = useState(null);
  const { data: pods, error, loading } = useGet(
    `/api/v1/pods?fieldSelector=spec.nodeName=${nodeName},status.phase!=Failed,status.phase!=Succeeded&limit=500`,
  );

  const nodeResources = useMemo(() => calcNodeResources(pods), [pods]);

  useEffect(() => {
    if (nodeResources) {
      setData(nodeResources);
    }
  }, [nodeResources]);
  return {
    data,
    error,
    loading,
  };
}
