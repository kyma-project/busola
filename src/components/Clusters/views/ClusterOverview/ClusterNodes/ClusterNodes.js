import React from 'react';
import { ErrorPanel } from 'shared/components/ErrorPanel/ErrorPanel';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import {
  useNodesQuery,
  usePrometheusNodesQuery,
} from 'components/Nodes/nodeQueries';
import { EventsList } from 'shared/components/EventsList';
import { EVENT_MESSAGE_TYPE } from 'hooks/useMessageList';
import { StatsPanel } from 'shared/components/StatsGraph/StatsPanel';
import { ResourceCommitment } from './ResourceCommitment/ResourceCommitment';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { ProgressBar } from 'shared/components/ProgressBar/ProgressBar';
import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import { useFeature } from 'hooks/useFeature';

import './ClusterNodes.scss';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { useUrl } from 'hooks/useUrl';

const NodeHeader = ({ nodeName }) => {
  const { clusterUrl } = useUrl();
  return (
    <Link className="fd-link" to={clusterUrl(`overview/nodes/${nodeName}`)}>
      {nodeName}
    </Link>
  );
};

export function ClusterNodes() {
  const { t } = useTranslation();

  const prometheus = useFeature('PROMETHEUS');
  const usePrometheusQueries = prometheus?.isEnabled;

  const {
    data: prometheusData,
    error: prometheusDataError,
    loading: prometheusDataLoading,
  } = usePrometheusNodesQuery(!usePrometheusQueries);
  const {
    nodes,
    error: nodesDataError,
    loading: nodesDataLoading,
  } = useNodesQuery(usePrometheusQueries === undefined || usePrometheusQueries);

  const data = usePrometheusQueries ? prometheusData : nodes;
  const error = usePrometheusQueries ? prometheusDataError : nodesDataError;
  const loading = usePrometheusQueries
    ? prometheusDataLoading
    : nodesDataLoading;

  const getStatusType = status => {
    if (status === 'Ready') return 'success';
    return undefined;
  };

  const getStatus = status => {
    const conditions = status?.conditions || [];
    const currentStatus = conditions.find(c => c?.status === 'True');
    return currentStatus ? (
      <StatusBadge
        additionalContent={currentStatus.message}
        resourceKind="nodes"
        type={getStatusType(currentStatus.type)}
      >
        {currentStatus.type}
      </StatusBadge>
    ) : (
      EMPTY_TEXT_PLACEHOLDER
    );
  };

  const headerRenderer = () => [
    t('common.headers.name'),
    t('cluster-overview.headers.cpu'),
    t('cluster-overview.headers.memory'),
    t('common.headers.created'),
    t('common.headers.version'),
    t('common.headers.status'),
    t('common.headers.region'),
    t('common.headers.zone'),
  ];

  const rowRenderer = entry => {
    const { cpu, memory } = entry?.metrics || {};
    const region = entry?.metadata?.labels?.['topology.kubernetes.io/region'];
    const zone = entry?.metadata?.labels?.['topology.kubernetes.io/zone'];

    return [
      <NodeHeader nodeName={entry.metadata?.name} />,
      cpu ? (
        <ProgressBar
          percentage={cpu.percentage}
          tooltip={{
            content: t('cluster-overview.tooltips.cpu-used', {
              percentage: cpu.percentage,
            }),
            position: 'bottom',
          }}
          color="var(--sapIndicationColor_7)"
        />
      ) : (
        EMPTY_TEXT_PLACEHOLDER
      ),
      memory ? (
        <ProgressBar
          percentage={memory.percentage}
          tooltip={{
            content: t('cluster-overview.tooltips.memory-used', {
              percentage: memory.percentage,
            }),
            position: 'bottom',
          }}
          color="var(--sapIndicationColor_6)"
        />
      ) : (
        EMPTY_TEXT_PLACEHOLDER
      ),
      <ReadableCreationTimestamp
        timestamp={entry.metadata?.creationTimestamp}
      />,
      entry.status?.nodeInfo?.kubeProxyVersion || EMPTY_TEXT_PLACEHOLDER,
      getStatus(entry.status),
      region ?? EMPTY_TEXT_PLACEHOLDER,
      zone ?? EMPTY_TEXT_PLACEHOLDER,
    ];
  };

  const Events = <EventsList defaultType={EVENT_MESSAGE_TYPE.WARNING} />;

  // This sets and unsets cluster version.
  // Should be stored and cleared if cluster is changed in a central state once Redux is installed
  window.localStorage.setItem(
    'cluster.version',
    data?.[0]?.status?.nodeInfo?.kubeletVersion,
  );

  return (
    <>
      {!(error && error.toString().includes('Error: nodes is forbidden')) && (
        <GenericList
          title={t('cluster-overview.headers.nodes')}
          actions={[]}
          entries={data || []}
          headerRenderer={headerRenderer}
          rowRenderer={rowRenderer}
          serverDataError={usePrometheusQueries ? prometheusDataError : error}
          serverDataLoading={
            !data && (usePrometheusQueries ? prometheusDataLoading : loading)
          }
          pagination={{ autoHide: true }}
          testid="cluster-nodes"
          searchSettings={{
            showSearchField: false,
            allowSlashShortcut: false,
          }}
        />
      )}
      {error &&
        !error.toString().includes('Error: nodes is forbidden') &&
        !data && (
          <ErrorPanel
            error={error}
            title={t('cluster-overview.headers.metrics')}
          />
        )}
      <div className="fd-margin--md cluster-overview__graphs-wrapper">
        <StatsPanel type="cluster" className="" />
        <ResourceCommitment />
      </div>
      {Events}
    </>
  );
}
