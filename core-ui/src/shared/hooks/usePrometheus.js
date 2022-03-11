import { useEffect, useState } from 'react';
import { useGet } from 'react-shared';

const getPrometheusSelector = data => {
  return `cluster="", container!="", namespace="${data.namespace}", pod="${data.pod}"`;
};

const getPrometheusCPUQuery = (type, data, step) => {
  if (type === 'cluster') {
    return `count(node_cpu_seconds_total{mode="idle"}) - sum(rate(node_cpu_seconds_total{mode="idle"}[${step}s]))`;
  } else if (type === 'pod') {
    return `sum(node_namespace_pod_container:container_cpu_usage_seconds_total:sum_rate{${getPrometheusSelector(
      data,
    )}})`;
  } else {
    return '';
  }
};

const getPrometheusMemoryQuery = (type, data) => {
  if (type === 'cluster') {
    return `sum(node_memory_MemTotal_bytes - node_memory_MemFree_bytes)`;
  } else if (type === 'pod') {
    return `sum(node_namespace_pod_container:container_cpu_usage_seconds_total:sum_rate{${getPrometheusSelector(
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
    return `sum(irate(container_network_receive_bytes_total{${getPrometheusSelector(
      data,
    )}}[${step}s]))`;
  } else {
    return '';
  }
};

const getPrometheusNodesQuery = () => {
  return `sum(kubelet_node_name)`;
};

export function getMetric(type, metric, { step, ...data }) {
  const metrics = {
    cpu: {
      prometheusQuery: getPrometheusCPUQuery(type, data, step),
      unit: '',
    },
    memory: {
      prometheusQuery: getPrometheusMemoryQuery(type, data),
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
  };
  return metrics[metric];
}

export function usePrometheus(type, metricId, { items, timeSpan, ...props }) {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [step, setStep] = useState(timeSpan / items);

  const metric = getMetric(type, metricId, { step, ...props });

  const tick = () => {
    const newEndDate = new Date();
    const newStartDate = new Date();

    newEndDate.setTime(Date.now());
    newStartDate.setTime(newEndDate.getTime() - (timeSpan - 1) * 1000);
    setEndDate(newEndDate);
    setStartDate(newStartDate);

    setStep(timeSpan / items);
  };

  useEffect(() => {
    tick();
    const loop = setInterval(tick, step * 1000);
    return () => clearInterval(loop);
  }, [metricId, timeSpan]); // eslint-disable-line react-hooks/exhaustive-deps

  const {
    data,
    error,
    loading,
  } = useGet(
    `/api/v1/namespaces/kyma-system/services/monitoring-prometheus:web/proxy/api/v1/query_range?` +
      `start=${startDate.toISOString()}&` +
      `end=${endDate.toISOString()}&` +
      `step=${step}&` +
      `query=${metric.prometheusQuery}`,
    { pollingInterval: 0 },
  );

  const DATA_POINTS = 60;
  let stepMultiplier = 0;
  let helpIndex = 0;
  const dataValues = data?.data.result[0]?.values;
  let prometheusData = [];

  if (dataValues?.length > 0) {
    for (let i = 0; i < DATA_POINTS; i++) {
      const [timestamp, graphValue] = dataValues[helpIndex];
      const temp = Math.floor(startDate.getTime() / 1000 - timestamp);

      if (stepMultiplier === Math.abs(temp)) {
        helpIndex++;
        prometheusData.push(graphValue);
      } else {
        prometheusData.push(null);
      }
      stepMultiplier += step;
    }
  }

  return {
    data: prometheusData,
    error,
    loading,
    step,
    binary: metric.binary,
    unit: metric.unit,
    startDate,
    endDate,
  };
}
