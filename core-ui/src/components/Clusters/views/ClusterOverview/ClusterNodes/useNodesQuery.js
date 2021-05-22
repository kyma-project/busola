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

export function useNodesQuery() {
  const [data, setData] = React.useState(null);
  const {
    data: nodeMetrics,
    error: metricsError,
    loading: metricsLoading,
  } = useGet('/apis/metrics.k8s.io/v1beta1/nodes', {
    pollingInterval: 3000,
  });

  const {
    data: nodes,
    error: nodesError,
    loading: nodesLoading,
  } = useGet('/api/v1/nodes', { pollingInterval: 3000 });

  React.useEffect(() => {
    if (nodes && nodeMetrics) {
      const getNodeMetrics = n => {
        const metrics = nodeMetrics.items.find(
          nM => n.metadata.name === nM.metadata.name,
        );

        const cpuUsage = formatCpu(metrics?.usage.cpu);
        const memoryUsage = formatMemory(metrics?.usage.memory);
        const allocatableCpu = parseInt(n.status.allocatable?.cpu || '0');
        const allocatableMemory = formatMemory(n.status.allocatable?.memory);

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

      setData(
        nodes.items.map(n => ({
          name: n.metadata.name,
          creationTimestamp: n.metadata.creationTimestamp,
          ...getNodeMetrics(n),
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
