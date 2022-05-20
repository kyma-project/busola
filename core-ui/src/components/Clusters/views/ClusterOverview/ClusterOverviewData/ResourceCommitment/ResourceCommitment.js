import React, { useState } from 'react';
import { useFeature } from 'shared/hooks/useFeature';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { LayoutPanel } from 'fundamental-react';
import './ResourceCommitment.scss';

function useMiniQuery(serviceUrl, query, time) {
  query = encodeURIComponent(query);
  const url = `${serviceUrl}/query?query=${query}&time=${time}`;
  const { data, loading, error } = useGet(url, {
    pollingInterval: 0,
    skip: !serviceUrl,
  });

  // eslint-disable-next-line no-unused-vars
  const [_date, value] = data?.data?.result[0]?.value || [];
  return { value: parseFloat(value), loading, error };
}

function flattenRequests(requests) {
  return {
    data: requests.map(request => ({
      name: request.name,
      value: request.query.value,
    })),
    loading: requests.some(query => query.loading), // any loading=true
    error: requests.find(query => query.error), // find first error
  };
}

function useMemoryQueries(serviceUrl, time) {
  const queries = [
    {
      name: 'allocated',
      query: useMiniQuery(
        serviceUrl,
        '1 - sum(:node_memory_MemAvailable_bytes:sum{cluster=""}) / sum(node_memory_MemTotal_bytes{job="node-exporter",cluster=""})',
        time,
      ),
    },
    {
      name: 'requests',
      query: useMiniQuery(
        serviceUrl,
        'sum(namespace_memory:kube_pod_container_resource_requests:sum{cluster=""}) / sum(kube_node_status_allocatable{job="kube-state-metrics",resource="memory",cluster=""})',
        time,
      ),
    },
    {
      name: 'limits',
      query: useMiniQuery(
        serviceUrl,
        'sum(namespace_memory:kube_pod_container_resource_limits:sum{cluster=""}) / sum(kube_node_status_allocatable{job="kube-state-metrics",resource="memory",cluster=""})',
        time,
      ),
    },
  ];

  return flattenRequests(queries);
}

function useCpuQueries(serviceUrl, time) {
  const queries = [
    {
      name: 'allocated',
      query: useMiniQuery(
        serviceUrl,
        '1 - sum(avg by (mode) (rate(node_cpu_seconds_total{job="node-exporter", mode=~"idle|iowait|steal", cluster=""}[150s])))',
        time,
      ),
    },
    {
      name: 'limits',
      query: useMiniQuery(
        serviceUrl,
        'sum(namespace_cpu:kube_pod_container_resource_limits:sum{cluster=""}) / sum(kube_node_status_allocatable{job="kube-state-metrics",resource="cpu",cluster=""})',
        time,
      ),
    },
    {
      name: 'requests',
      query: useMiniQuery(
        serviceUrl,
        'sum(namespace_cpu:kube_pod_container_resource_requests:sum{cluster=""}) / sum(kube_node_status_allocatable{job="kube-state-metrics",resource="cpu",cluster=""})',
        time,
      ),
    },
  ];

  return flattenRequests(queries);
}

export function ResourceCommitment() {
  const { isEnabled, serviceUrl } = useFeature('PROMETHEUS');
  const [time] = useState(Math.floor(Date.now() / 1000));

  const memoryQueries = useMemoryQueries(serviceUrl, time);
  const cpuQueries = useCpuQueries(serviceUrl, time);
  if (memoryQueries.loading || cpuQueries.loading) {
    return null;
  }
  const { data: memory } = memoryQueries;
  const { data: cpu } = cpuQueries;

  memory.push({
    name: 'allocatable',
    value: 1,
  });
  cpu.push({
    name: 'allocatable',
    value: 1,
  });

  memory.sort((a, b) => a.value - b.value);
  cpu.sort((a, b) => a.value - b.value);

  if (!isEnabled) return null;

  const Sub = ({ title, data }) => {
    const max = data.at(-1).value;

    data.forEach((v, i) => {
      v.width = data[i - 1] ? data[i].value - data[i - 1].value : data[i].value;
    });

    return (
      <>
        <p>{title}</p>
        <div className="main">
          {data.map((v, i) => {
            return (
              <div
                key={v.name}
                className={`box--${v.name}`}
                style={{
                  width: `${(v.width / max) * 100}%`,
                  zIndex: data.length - i,
                }}
              >
                <Tooltip
                  position="bottom"
                  content={`${v.name}, val: ${v.value.toFixed(2)}`}
                >
                  <div className="in" />
                </Tooltip>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <LayoutPanel>
      <LayoutPanel.Header>
        <LayoutPanel.Head title="Resource Commitment" />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        <Sub title="CPU" data={cpu} />
        <Sub title="Memory" data={memory} />
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
