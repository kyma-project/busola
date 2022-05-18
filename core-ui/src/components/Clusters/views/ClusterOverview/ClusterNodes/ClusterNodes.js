import React from 'react';
import LuigiClient from '@luigi-project/client';
import { ErrorPanel } from 'shared/components/ErrorPanel/ErrorPanel';
import { Link } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import { useNodesQuery } from 'components/Nodes/nodeQueries';
import { EventsList } from 'shared/components/EventsList';
import { EVENT_MESSAGE_TYPE } from 'hooks/useMessageList';
import { StatsPanel } from 'shared/components/StatsGraph/StatsPanel';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { ProgressBar } from 'shared/components/ProgressBar/ProgressBar';
import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
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
  const { nodes, error, loading } = useNodesQuery();
  const { i18n } = useTranslation();

  const getStatusType = status => {
    if (status === 'Ready') return 'success';
    return undefined;
  };

  const getStatus = node => {
    const conditions = node?.status?.conditions || [];
    const status = conditions.find(c => c?.status === 'True');
    return status ? (
      <StatusBadge
        i18n={i18n}
        additionalContent={status.message}
        resourceKind="nodes"
        type={getStatusType(status.type)}
      >
        {status.type}
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
      <NodeHeader nodeName={entry.name} />,
      cpu ? (
        <ProgressBar
          current={cpu.usage}
          max={cpu.capacity}
          percentage={cpu.percentage}
          tooltip={{
            content: `
        Used: ${cpu.usage}m 
        Available: ${cpu.capacity}m
        `,
            position: 'bottom',
          }}
        />
      ) : (
        EMPTY_TEXT_PLACEHOLDER
      ),
      memory ? (
        <ProgressBar
          current={memory.usage}
          max={memory.capacity}
          percentage={memory.percentage}
          tooltip={{
            content: `
        Used: ${memory.usage}GiB 
        Available: ${memory.capacity}GiB
        `,
            position: 'bottom',
          }}
        />
      ) : (
        EMPTY_TEXT_PLACEHOLDER
      ),
      <ReadableCreationTimestamp timestamp={entry.creationTimestamp} />,
      entry.node?.status?.nodeInfo?.kubeProxyVersion || EMPTY_TEXT_PLACEHOLDER,
      getStatus(entry.node),
    ];
  };

  const Events = <EventsList defaultType={EVENT_MESSAGE_TYPE.WARNING} />;

  return (
    <>
      <GenericList
        title={'Nodes'}
        allowSlashShortcut={false}
        showSearchField={false}
        actions={[]}
        entries={nodes || []}
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
        serverDataError={error}
        serverDataLoading={loading}
        pagination={{ autoHide: true }}
        i18n={i18n}
      />
      {loading && (
        <div className="cluster-overview__nodes">
          <Skeleton height="220px" />
        </div>
      )}
      {error && !nodes && (
        <ErrorPanel error={error} title="Metrics" i18n={i18n} />
      )}
      <StatsPanel type="cluster" />
      {Events}
    </>
  );
}
