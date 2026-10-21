import { ErrorPanel } from 'shared/components/ErrorPanel/ErrorPanel';
import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { EventsList } from 'shared/components/EventsList';
import { EVENT_MESSAGE_TYPE } from 'hooks/useMessageList';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';

import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { toSentenceCase } from 'shared/utils/helpers';
import { useUrl } from 'hooks/useUrl';
import { Link } from 'shared/components/Link/Link';
import { UsageMetrics } from 'resources/Pods/types';

type ClusterNodesProps = {
  data?: any[];
  error?: Error;
  loading?: boolean;
};

// Memoized so parent (node/stats) polling doesn't re-render the events table.
const WarningEvents = memo(function WarningEvents() {
  return <EventsList defaultType={EVENT_MESSAGE_TYPE.WARNING} />;
});

type RowRendererEntry = {
  metadata?: {
    name?: string;
    creationTimestamp?: string;
    labels?: Record<string, string>;
  };
  status?: {
    conditions?: { status?: string; type?: string; message?: string }[];
    nodeInfo?: {
      kubeletVersion?: string;
    };
  };
  metrics?: UsageMetrics;
};

export function ClusterNodes({ data, error, loading }: ClusterNodesProps) {
  const { clusterUrl } = useUrl();
  const { t } = useTranslation();

  const getStatusType = (status?: string) => {
    if (status === 'Ready') return 'Positive';
    return 'None';
  };

  const getStatus = (status?: {
    conditions?: { status?: string; type?: string; message?: string }[];
  }) => {
    const conditions = status?.conditions || [];
    const currentStatus = conditions.find((c) => c?.status === 'True');
    return currentStatus ? (
      <StatusBadge
        additionalContent={currentStatus.message}
        resourceKind="nodes"
        type={getStatusType(currentStatus.type)}
      >
        {toSentenceCase(currentStatus.type)}
      </StatusBadge>
    ) : (
      EMPTY_TEXT_PLACEHOLDER
    );
  };

  const headerRenderer = () => [
    t('common.headers.name'),
    t('common.headers.status'),
    t('cluster-overview.headers.cpu-usage'),
    t('cluster-overview.headers.cpu-requests'),
    t('cluster-overview.headers.memory-usage'),
    t('cluster-overview.headers.memory-requests'),
    t('common.headers.zone'),
    t('common.headers.created'),
  ];

  // Create a link without layout parameter as the node view is full page.
  const nodeUrl = (entry?: RowRendererEntry) =>
    clusterUrl(
      `overview/nodes/${encodeURIComponent(entry?.metadata?.name ?? '')}`,
    );

  const rowRenderer = (entry?: RowRendererEntry) => {
    const { cpu, memory } = entry?.metrics || {};

    return [
      <Link
        key={`node-details-link-${entry?.metadata?.name}`}
        style={{
          fontWeight: 'bold',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
        }}
        data-testid={`node-details-link-${entry?.metadata?.name}`}
        url={nodeUrl(entry)}
        layout={false}
      >
        {entry?.metadata?.name}
      </Link>,
      getStatus(entry?.status),
      cpu ? `${cpu.percentageValue}%` : EMPTY_TEXT_PLACEHOLDER,
      cpu ? `${cpu.requestValue}%` : EMPTY_TEXT_PLACEHOLDER,
      memory ? `${memory.percentageValue}%` : EMPTY_TEXT_PLACEHOLDER,
      memory ? `${memory.requestValue}%` : EMPTY_TEXT_PLACEHOLDER,
      entry?.metadata?.labels?.['topology.kubernetes.io/zone'] ??
        EMPTY_TEXT_PLACEHOLDER,
      <ReadableCreationTimestamp
        key={entry?.metadata?.creationTimestamp}
        timestamp={entry?.metadata?.creationTimestamp ?? ''}
      />,
    ];
  };
  const Events = <WarningEvents />;

  // This sets and unsets cluster version.
  // Should be stored and cleared if cluster is changed in a central state once Redux is installed
  const kubeletVersion = data?.[0]?.status?.nodeInfo?.kubeletVersion;
  useEffect(() => {
    window.localStorage.setItem('cluster.version', kubeletVersion);
  }, [kubeletVersion]);

  return (
    <>
      {!(error && error.toString().includes('Error: nodes is forbidden')) && (
        <GenericList
          title={`${t('cluster-overview.headers.nodes')}${data ? ` (${data.length})` : ''}`}
          actions={[]}
          entries={data || []}
          headerRenderer={headerRenderer}
          rowRenderer={rowRenderer}
          serverDataError={error}
          serverDataLoading={!data && loading}
          pagination={{ autoHide: true }}
          testid="cluster-nodes"
          searchSettings={{
            showSearchField: false,
            allowSlashShortcut: false,
          }}
          hasDetailsView
          customUrl={nodeUrl}
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
      {Events}
    </>
  );
}
