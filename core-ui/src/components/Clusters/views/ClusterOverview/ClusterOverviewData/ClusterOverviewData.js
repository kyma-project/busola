import React, { useState } from 'react';
import LuigiClient from '@luigi-project/client';
import { ErrorPanel } from 'shared/components/ErrorPanel/ErrorPanel';
import { Pagination } from 'shared/components/GenericList/Pagination/Pagination';
import { LayoutPanel, Link } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import { useNodesQuery } from 'components/Nodes/nodeQueries';
import { NodeResources } from 'components/Nodes/NodeResources/NodeResources';
import { EventsList } from 'shared/components/EventsList';
import { EVENT_MESSAGE_TYPE } from 'hooks/useMessageList';
import { StatsPanel } from 'shared/components/StatsGraph/StatsPanel';
import Skeleton from 'shared/components/Skeleton/Skeleton';

import './ClusterOverviewData.scss';
import { useFeature } from 'shared/hooks/useFeature';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';

const NodeHeader = ({ nodeName }) => {
  const navigateToNodeDetails = nodeName =>
    LuigiClient.linkManager().navigate(`nodes/${nodeName}`);

  return (
    <>
      <p className="node-header-title">Node:</p>
      <Link className="fd-link" onClick={() => navigateToNodeDetails(nodeName)}>
        {nodeName}
      </Link>
    </>
  );
};

function useMiniQuery(serviceUrl, query, time) {
  query = encodeURIComponent(query);
  const url = `${serviceUrl}/query?query=${query}&time=${time}`;
  const { data, loading, error } = useGet(url, {
    pollingInterval: 0,
    skip: !serviceUrl,
  });

  // eslint-disable-next-line no-unused-vars
  const [_date, value] = data?.data?.result[0]?.value || [];
  return { data: parseFloat(value), loading, error };
}

function flatten(obj) {
  const { fromEntries, entries, values } = Object;
  return {
    data: Object.fromEntries(
      Object.entries(obj).map(([key, { data }]) => [key, data]),
    ), // object with data
    loading: values(obj).some(({ loading }) => loading), // any loading=true
    error: values(obj).find(({ error }) => error), // find first error
  };
}

function useMemoryQueries(serviceUrl, time) {
  const d = {
    requests: useMiniQuery(
      serviceUrl,
      'sum(namespace_memory:kube_pod_container_resource_requests:sum{})',
      time,
    ),
    limits: useMiniQuery(
      serviceUrl,
      'sum(namespace_memory:kube_pod_container_resource_limits:sum{})',
      time,
    ),
    allocatable: useMiniQuery(
      serviceUrl,
      'sum(kube_node_status_allocatable{resource="memory"})',
      time,
    ),
    allocated: useMiniQuery(
      serviceUrl,
      'sum(:node_memory_MemAvailable_bytes:sum{})',
      time,
    ),
    allocated_fraction: useMiniQuery(
      serviceUrl,
      '1 - sum(:node_memory_MemAvailable_bytes:sum{}) / sum(node_memory_MemTotal_bytes{})',
      time,
    ),
  };

  const f = flatten(d);

  f.data = {
    requests: f.data.requests,
    limits: f.data.limits,
    allocated:
      f.data.allocatable - (1 - f.data.allocated_fraction) * f.data.allocatable,
    allocatable: f.data.allocatable,
  };
  return f;
}

function useCpuQueries(serviceUrl, time) {
  const d = {
    requests: useMiniQuery(
      serviceUrl,
      'sum(namespace_cpu:kube_pod_container_resource_requests:sum{})',
      time,
    ),
    limits: useMiniQuery(
      serviceUrl,
      'sum(namespace_cpu:kube_pod_container_resource_limits:sum{})',
      time,
    ),
    allocatable: useMiniQuery(
      serviceUrl,
      'sum(kube_node_status_allocatable{job="kube-state-metrics",resource="cpu"})',
      time,
    ),
    allocated_fraction: useMiniQuery(
      serviceUrl,
      'sum(avg by (mode) (rate(node_cpu_seconds_total{job="node-exporter", mode=~"idle|iowait|steal"}[150s])))',
      time,
    ),
  };

  const f = flatten(d);

  f.data = {
    requests: f.data.requests,
    limits: f.data.limits,
    allocated: (1 - f.data.allocated_fraction) * f.data.allocatable,
    allocatable: f.data.allocatable,
  };
  return f;
}

function ResourceCommitment() {
  const { isEnabled, serviceUrl } = useFeature('PROMETHEUS');
  const [time] = useState(Math.floor(Date.now() / 1000));

  const memoryQueries = useMemoryQueries(serviceUrl, time);
  const cpuQueries = useCpuQueries(serviceUrl, time);
  if (memoryQueries.loading || cpuQueries.loading) {
    return null;
  }
  const { data: mQData } = memoryQueries;
  const { data: cQData } = cpuQueries;
  console.log('memory', {
    requests: (mQData.requests / mQData.allocatable) * 100,
    limits: (mQData.limits / mQData.allocatable) * 100,
    allocated: (mQData.allocated / mQData.allocatable) * 100,
    allocatable: 100,
  });
  console.log('cpu', {
    requests: (cQData.requests / cQData.allocatable) * 100,
    limits: (cQData.limits / cQData.allocatable) * 100,
    allocated: (cQData.allocated / cQData.allocatable) * 100,
    allocatable: 100,
  });

  const memory = [
    {
      name: 'requests',
      value: mQData.requests / mQData.allocatable,
      realVal: mQData.requests / 1024 / 1024 / 1024,
    },
    {
      name: 'limits',
      value: mQData.limits / mQData.allocatable,
      realVal: mQData.limits / 1024 / 1024 / 1024,
    },
    {
      name: 'allocated',
      value: mQData.allocated / mQData.allocatable,
      realVal: mQData.allocated / 1024 / 1024 / 1024,
    },
    {
      name: 'allocatable',
      value: 1,
      realVal: mQData.allocatable / 1024 / 1024 / 1024,
    },
  ];
  memory.sort((a, b) => a.value - b.value);
  const cpu = [
    {
      name: 'requests',
      value: cQData.requests / cQData.allocatable,
      realVal: cQData.requests,
    },
    {
      name: 'limits',
      value: cQData.limits / cQData.allocatable,
      realVal: cQData.limits,
    },
    {
      name: 'allocated',
      value: cQData.allocated / cQData.allocatable,
      realVal: cQData.allocated,
    },
    { name: 'allocatable', value: 1, realVal: cQData.allocatable },
  ];
  cpu.sort((a, b) => a.value - b.value);

  if (!isEnabled) return null;

  const Sub = ({ title, data, unit }) => {
    const max = data.at(-1).value;

    data.forEach((v, i) => {
      v.width = data[i - 1] ? data[i].value - data[i - 1].value : data[i].value;
    });

    return (
      <div>
        <p>{title}</p>
        <div className="main">
          {data.map((v, i) => {
            return (
              <div
                key={v.name}
                class={`box--${v.name}`}
                style={{
                  width: `${(v.width / max) * 100}%`,
                  zIndex: data.length - i,
                }}
              >
                <Tooltip
                  position="bottom"
                  content={`${v.name}, val: ${v.realVal.toFixed(2)} ${unit}`}
                >
                  <div className="in" />
                </Tooltip>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <LayoutPanel>
      <LayoutPanel.Header>
        <LayoutPanel.Head title="Resource Commitment" />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        <Sub title="CPU" data={cpu} unit="cores" />
        <Sub title="Memory" data={memory} unit="GB" />
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}

export function ClusterOverviewData() {
  const { nodes, error, loading } = useNodesQuery();
  const { i18n } = useTranslation();
  const itemsPerPage = 8;
  const [currentPage, setCurrentPage] = React.useState(1);

  const pagedNodes =
    nodes?.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    ) || [];

  const Events = <EventsList defaultType={EVENT_MESSAGE_TYPE.WARNING} />;

  return (
    <>
      {loading && (
        <div className="cluster-overview__nodes">
          <Skeleton height="220px" />
        </div>
      )}
      {error && !nodes && (
        <ErrorPanel error={error} title="Metrics" i18n={i18n} />
      )}
      <div className="cluster-overview__nodes">
        {pagedNodes.map(node => (
          <NodeResources
            key={node.name}
            {...node}
            headerContent={<NodeHeader nodeName={node.name} />}
          />
        ))}
      </div>
      {nodes?.length > itemsPerPage && (
        <LayoutPanel.Footer>
          <Pagination
            itemsTotal={nodes?.length || 0}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onChangePage={setCurrentPage}
          />
        </LayoutPanel.Footer>
      )}
      <div className="fd-margin--md cluster-overview__graphs-wrapper">
        <StatsPanel type="cluster" className="" />
        <ResourceCommitment />
      </div>
      {Events}
    </>
  );
}
