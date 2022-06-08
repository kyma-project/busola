import React from 'react';
import LuigiClient from '@luigi-project/client';
import { ErrorPanel } from 'shared/components/ErrorPanel/ErrorPanel';
import { Link } from 'fundamental-react';
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
import { useFeature } from 'shared/hooks/useFeature';

import './ClusterNodes.scss';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';

const NodeHeader = ({ nodeName }) => {
  const navigateToNodeDetails = nodeName =>
    LuigiClient.linkManager().navigate(`nodes/${nodeName}`);

  return (
    <Link className="fd-link" onClick={() => navigateToNodeDetails(nodeName)}>
      {nodeName}
    </Link>
  );
};

export function ClusterNodes() {
  const { t, i18n } = useTranslation();
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
        i18n={i18n}
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
  ];

  const rowRenderer = entry => {
    const { cpu, memory } = entry?.metrics || {};
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
      <GenericList
        title={t('cluster-overview.headers.nodes')}
        allowSlashShortcut={false}
        showSearchField={false}
        actions={[]}
        entries={data || []}
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
        serverDataError={usePrometheusQueries ? prometheusDataError : error}
        serverDataLoading={
          !data && (usePrometheusQueries ? prometheusDataLoading : loading)
        }
        pagination={{ autoHide: true }}
        i18n={i18n}
        testid="cluster-nodes"
      />
      {error && !data && (
        <ErrorPanel
          error={error}
          title={t('cluster-overview.headers.metrics')}
          i18n={i18n}
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
