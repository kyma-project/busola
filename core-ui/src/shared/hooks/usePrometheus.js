import { useEffect, useState } from 'react';
import { useGet } from 'react-shared';

export function usePrometheus({ metric, items, timeSpan, selector }) {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [step, setStep] = useState(timeSpan / items);

  const metrics = {
    cpu: {
      query: `node_namespace_pod_container:container_cpu_usage_seconds_total:sum_rate{${selector}}`,
      unit: '',
    },
    'cpu-percent': {
      query: `sum(node_namespace_pod_container:container_cpu_usage_seconds_total:sum_rate{${selector}}) / sum(kube_pod_container_resource_limits_cpu_cores{${selector}}) * 100`,
      unit: '%',
    },
    memory: {
      query: `sum(container_memory_working_set_bytes{${selector}})`,
      unit: 'B',
    },
    'network-down': {
      query: `sum(irate(container_network_receive_bytes_total{${selector}}[${step}s]))`,
      unit: 'B/s',
    },
    'network-up': {
      query: `sum(irate(container_network_transmit_bytes_total{${selector}}[${step}s]))`,
      unit: 'B/s',
    },
  };
  const metricDef = metrics[metric];

  useEffect(() => {
    endDate.setTime(Date.now());
    startDate.setTime(endDate.getTime() - (timeSpan - 1) * 1000);
    setEndDate(endDate);
    setStartDate(startDate);
    setStep(timeSpan / items);

    const loop = setInterval(() => {
      const now = new Date();
      setEndDate(now);
      startDate.setTime(now.getTime() - (timeSpan - 1) * 1000);
      setStartDate(startDate);
    }, step * 1000);
    return () => clearInterval(loop);
  }, [metric, timeSpan]);

  // TODO multiple queries?
  const {
    data,
    error,
    loading,
  } = useGet(
    `/api/v1/namespaces/kyma-system/services/monitoring-prometheus:web/proxy/api/v1/query_range?` +
      `start=${startDate.toISOString()}&` +
      `end=${endDate.toISOString()}&` +
      `step=${step}&` +
      `query=${metricDef.query}`,
    { pollingInterval: 0 },
  );

  let dataValues = data?.data.result[0]?.values.map(
    ([timestamp, value]) => value,
  );

  return {
    data: dataValues,
    error,
    loading,
    step,
    unit: metricDef.unit,
  };
}
