import React from 'react';
import LuigiClient from '@luigi-project/client';
import { ErrorPanel } from 'shared/components/ErrorPanel/ErrorPanel';
import { Link } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import {
  useNodesQuery,
  usePrometheusNodeQuery,
} from 'components/Nodes/nodeQueries';
import { EventsList } from 'shared/components/EventsList';
import { EVENT_MESSAGE_TYPE } from 'hooks/useMessageList';
import { StatsPanel } from 'shared/components/StatsGraph/StatsPanel';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { ProgressBar } from 'shared/components/ProgressBar/ProgressBar';
import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import Skeleton from 'shared/components/Skeleton/Skeleton';

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
  const { features } = useMicrofrontendContext();
  const usePrometheusQueries = features.PROMETHEUS?.isEnabled;

  const {
    data: prometheusData,
    error: prometheusDataError,
    loading: prometheusDataLoading,
  } = usePrometheusNodeQuery(!usePrometheusQueries);
  const { nodes, error, loading } = useNodesQuery(usePrometheusQueries);

  const data = usePrometheusQueries ? prometheusData : nodes;
  const { i18n } = useTranslation();

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
    'Name',
    'CPU',
    'Memory',
    'Created',
    'Version',
    'Status',
  ];

  const rowRenderer = entry => {
    const { cpu, memory } = entry?.metrics || {};
    return [
      <NodeHeader nodeName={entry.metadata?.name} />,
      cpu ? (
        <ProgressBar
          current={cpu.usage}
          max={cpu.capacity}
          tooltip={{
            content: `
              Used: ${cpu.usage}m 
              Available: ${cpu.capacity}m
              `,
            position: 'bottom',
            color: 'var(--sapIndicationColor_5)',
          }}
        />
      ) : (
        EMPTY_TEXT_PLACEHOLDER
      ),
      memory ? (
        <ProgressBar
          current={memory.usage}
          max={memory.capacity}
          tooltip={{
            content: `
              Used: ${memory.usage}GiB 
              Available: ${memory.capacity}GiB
              `,
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
      getStatus(entry),
    ];
  };

  const Events = <EventsList defaultType={EVENT_MESSAGE_TYPE.WARNING} />;

  //TODO WHAT IS THIS LOADING THING
  return (
    <>
      <GenericList
        title={'Nodes'}
        allowSlashShortcut={false}
        showSearchField={false}
        actions={[]}
        entries={data || []}
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
        serverDataError={usePrometheusQueries ? prometheusDataError : error}
        serverDataLoading={
          usePrometheusQueries ? prometheusDataLoading : loading
        }
        pagination={{ autoHide: true }}
        i18n={i18n}
      />
      {loading && (
        <div className="cluster-overview__nodes">
          <Skeleton height="220px" />
        </div>
      )}
      {error && !data && (
        <ErrorPanel error={error} title="Metrics" i18n={i18n} />
      )}
      <StatsPanel type="cluster" />
      {Events}
    </>
  );
}
