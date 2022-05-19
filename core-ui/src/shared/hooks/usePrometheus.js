import { useEffect, useState } from 'react';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { useFeature } from 'shared/hooks/useFeature';

const getPrometheusSelector = data => {
  let selector = `cluster="", container!="", namespace="${data.namespace}"`;
  if (data.pod) {
    let pods = data.pod;
    if (Array.isArray(data.pod)) {
      pods = data.pod.join('|');
    }
    selector = `${selector}, pod=~"${pods}"`;
  }
  return selector;
};

const getPrometheusPVCUsedSpaceQuery = ({ name, namespace }) => {
  return `(
    sum without(instance, node) (topk(1, (kubelet_volume_stats_capacity_bytes{cluster="", job="kubelet", metrics_path="/metrics", namespace="${namespace}", persistentvolumeclaim="${name}"})))
    -
    sum without(instance, node) (topk(1, (kubelet_volume_stats_available_bytes{cluster="", job="kubelet", metrics_path="/metrics", namespace="${namespace}", persistentvolumeclaim="${name}"})))
  )
  `;
};

const getPrometheusPVCFreeSpaceQuery = ({ namespace, name }) => {
  return `sum without(instance, node) (topk(1, (kubelet_volume_stats_available_bytes{cluster="", job="kubelet", metrics_path="/metrics", namespace="${namespace}", persistentvolumeclaim="${name}"})))`;
};

const getPrometheusCPUQuery = (type, mode, data, step) => {
  if (type === 'cluster') {
    return `count(node_cpu_seconds_total{mode="idle"}) - sum(rate(node_cpu_seconds_total{mode="idle"}[${step}s]))`;
  } else if (type === 'pod' && mode === 'multiple') {
    return `sum by(container)(node_namespace_pod_container:container_cpu_usage_seconds_total:sum_irate{${getPrometheusSelector(
      data,
    )}, container != "POD"})`;
  } else if (type === 'pod' && mode === 'single') {
    return `sum(node_namespace_pod_container:container_cpu_usage_seconds_total:sum_irate{${getPrometheusSelector(
      data,
    )}})`;
  } else {
    return '';
  }
};

const getPrometheusMemoryQuery = (type, mode, data) => {
  if (type === 'cluster') {
    return `sum(node_memory_MemTotal_bytes - node_memory_MemFree_bytes)`;
  } else if (type === 'pod' && mode === 'multiple') {
    return `sum by(container)(node_namespace_pod_container:container_memory_working_set_bytes{${getPrometheusSelector(
      data,
    )}, container != "POD"})`;
  } else if (type === 'pod' && mode === 'single') {
    return `sum(node_namespace_pod_container:container_memory_working_set_bytes{${getPrometheusSelector(
      data,
    )}})`;
  } else {
    return '';
  }
};

const getPrometheusNetworkReceivedQuery = (type, data, step) => {
  if (type === 'cluster') {
    return `sum(rate(node_network_receive_bytes_total{device!="lo"}[${step}s]))`;
  } else if (type === 'pod') {
    return `sum(irate(container_network_receive_bytes_total{${getPrometheusSelector(
      data,
    )}}[${step}s]))`;
  } else {
    return '';
  }
};

const getPrometheusNetworkTransmittedQuery = (type, data, step) => {
  if (type === 'cluster') {
    return `sum(rate(node_network_transmit_bytes_total{device!="lo"}[${step}s]))`;
  } else if (type === 'pod') {
    return `sum(irate(container_network_transmit_bytes_total{${getPrometheusSelector(
      data,
    )}}[${step}s]))`;
  } else {
    return '';
  }
};

const getPrometheusNodesQuery = () => {
  return `sum(kubelet_node_name)`;
};

export function getMetric(type, mode, metric, { step, ...data }) {
  const metrics = {
    cpu: {
      prometheusQuery: getPrometheusCPUQuery(type, mode, data, step),
      unit: '',
    },
    memory: {
      prometheusQuery: getPrometheusMemoryQuery(type, mode, data),
      binary: true,
      unit: 'B',
    },
    'network-down': {
      prometheusQuery: getPrometheusNetworkReceivedQuery(type, data, step),
      unit: 'B/s',
    },
    'network-up': {
      prometheusQuery: getPrometheusNetworkTransmittedQuery(type, data, step),
      unit: 'B/s',
    },
    nodes: {
      prometheusQuery: getPrometheusNodesQuery(),
      unit: '',
    },
    'pvc-used-space': {
      prometheusQuery: getPrometheusPVCUsedSpaceQuery(data),
      binary: true,
      unit: 'B',
    },
    'pvc-free-space': {
      prometheusQuery: getPrometheusPVCFreeSpaceQuery(data),
      binary: true,
      unit: 'B',
    },
  };
  return metrics[metric];
}

export function usePrometheus(
  type,
  mode,
  metricId,
  { items, timeSpan, ...props },
) {
  const { serviceUrl } = useFeature('PROMETHEUS');
  const step = timeSpan / items;
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [query, setQuery] = useState(null);

  const metric = getMetric(type, mode, metricId, { step, ...props });

  useEffect(() => {
    const tick = () => {
      const newEndDate = new Date();
      const newStartDate = new Date();

      newEndDate.setTime(Date.now());
      newStartDate.setTime(newEndDate.getTime() - (timeSpan - 1) * 1000);
      setEndDate(newEndDate);
      setStartDate(newStartDate);

      setQuery(
        `query_range?` +
          `start=${newStartDate.toISOString()}&` +
          `end=${newEndDate.toISOString()}&` +
          `step=${timeSpan / items}&` +
          `query=${metric.prometheusQuery}`,
      );
    };

    tick();
    const loop = setInterval(tick, (timeSpan / items) * 1000);
    return () => clearInterval(loop);
  }, [timeSpan, items, metric.prometheusQuery]);

  let { data, error, loading } = useGet(`${serviceUrl}/${query}`, {
    pollingInterval: 0,
    skip: !query,
  });

  let prometheusData = [];
  let prometheusLabels = [];

  if (mode === 'multiple') {
    (data?.data.result || []).forEach(d => {
      let tempPrometheusData = [];

      let stepMultiplier = 0;
      let helpIndex = 0;
      const dataValues = d?.values;
      const metric = d?.metric;
      if (dataValues?.length > 0) {
        for (let i = 0; i < items; i++) {
          const [timestamp, graphValue] = dataValues[helpIndex] || [];
          const timeDifference = Math.floor(
            timestamp - startDate.getTime() / 1000,
          );
          if (stepMultiplier === timeDifference) {
            helpIndex++;
            tempPrometheusData.push(graphValue);
          } else {
            tempPrometheusData.push(null);
          }
          stepMultiplier += step;
        }
        prometheusLabels.push(`container="${metric.container}"`);
        prometheusData.push(tempPrometheusData);
      }
    });
  } else {
    const dataValues = data?.data.result[0]?.values;

    let stepMultiplier = 0;
    let helpIndex = 0;
    if (dataValues?.length > 0) {
      for (let i = 0; i < items; i++) {
        const [timestamp, graphValue] = dataValues[helpIndex] || [];
        const timeDifference = Math.floor(
          timestamp - startDate.getTime() / 1000,
        );
        if (stepMultiplier === timeDifference) {
          helpIndex++;
          prometheusData.push(graphValue);
        } else {
          prometheusData.push(null);
        }
        stepMultiplier += step;
      }
    }
  }

  return {
    data: prometheusData,
    defaultLabels: prometheusLabels,
    error,
    loading,
    step,
    binary: metric.binary,
    unit: metric.unit,
    startDate,
    endDate,
  };
}
