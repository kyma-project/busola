import React from 'react';
import { useGet } from 'react-shared';

const round = (num, places) =>
  Math.round(num * Math.pow(10, places)) / Math.pow(10, places);

const percentage = (value, total) => {
  if (total === 0) {
    return 'Unknown';
  }
  return Math.round((100 * value) / total) + '%';
};

const formatCpu = cpuStr => Math.ceil(parseInt(cpuStr || '0') / 1000_000);
const formatMemory = memoryStr =>
  round(parseInt(memoryStr || '0') / 1024 / 1024, 1);

const createUsageMetrics = (node, metricsForNode) => {
  const cpuUsage = formatCpu(metricsForNode?.usage.cpu);
  const memoryUsage = formatMemory(metricsForNode?.usage.memory);
  const allocatableCpu = parseInt(node.status.allocatable?.cpu || '0');
  const allocatableMemory = formatMemory(node.status.allocatable?.memory);

  return {
    cpu: {
      usage: cpuUsage,
      allocatable: allocatableCpu,
      percentage: percentage(cpuUsage, allocatableCpu),
    },
    memory: {
      usage: memoryUsage,
      allocatable: allocatableMemory,
      percentage: percentage(memoryUsage, allocatableMemory),
    },
  };
};

export function useNodesQuery() {
  const [data, setData] = React.useState(null);
  const {
    data: nodeMetrics,
    error: metricsError,
    loading: metricsLoading,
  } = useGet('/apis/metrics.k8s.io/v1beta1/nodes', {
    pollingInterval: 4000,
  });

  const {
    data: nodes,
    error: nodesError,
    loading: nodesLoading,
  } = useGet('/api/v1/nodes', { pollingInterval: 5500 });

  React.useEffect(() => {
    if (nodes) {
      const getNodeMetrics = node => {
        const metricsForNode = nodeMetrics.items.find(
          metrics => node.metadata.name === metrics.metadata.name,
        );
        return createUsageMetrics(node, metricsForNode);
      };

      setData(
        nodes.items.map(n => ({
          name: n.metadata.name,
          creationTimestamp: n.metadata.creationTimestamp,
          metrics: nodeMetrics ? getNodeMetrics(n) : [],
        })),
      );
    }
  }, [nodes, nodeMetrics]);

  return {
    nodes: data,
    error: metricsError || nodesError,
    loading: metricsLoading || nodesLoading,
  };
}

export function useNodeQuery(nodeName) {
  const [data, setData] = React.useState(null);
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

  React.useEffect(() => {
    if (node && nodeMetrics) {
      setData({
        node,
        metrics: createUsageMetrics(node, nodeMetrics),
      });
    }
  }, [node, nodeMetrics]);

  return {
    data,
    error: metricsError || nodeError,
    loading: metricsLoading || nodeLoading,
  };
}
