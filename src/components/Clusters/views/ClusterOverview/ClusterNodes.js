import { ErrorPanel } from 'shared/components/ErrorPanel/ErrorPanel';
import { useTranslation } from 'react-i18next';

import { EventsList } from 'shared/components/EventsList';
import { EVENT_MESSAGE_TYPE } from 'hooks/useMessageList';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';

import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { useUrl } from 'hooks/useUrl';
import { ProgressIndicatorWithPercentage } from 'shared/components/ProgressIndicatorWithPercentage/ProgressIndicatorWithPercentage';
import { Link } from 'shared/components/Link/Link';

export function ClusterNodes({ data, error, loading }) {
  const { clusterUrl } = useUrl();
  const { t } = useTranslation();

  const getStatusType = status => {
    if (status === 'Ready') return 'Positive';
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
    t('common.headers.status'),
    t('node-details.pool'),
    t('node-details.machine-type'),
    t('common.headers.zone'),
  ];

  const rowRenderer = entry => {
    const { cpu, memory } = entry?.metrics || {};

    return [
      <Link
        style={{ fontWeight: 'bold' }}
        data-testid={`node-details-link-${entry.metadata?.name}`}
        url={clusterUrl(`overview/nodes/${entry.metadata?.name}`)}
      >
        {entry.metadata?.name}
      </Link>,
      cpu ? (
        <>
          <ProgressIndicatorWithPercentage
            dataBarColor="var(--sapChart_Bad)"
            leftTitle={cpu.percentage}
            value={cpu.percentageValue}
            tooltip={{
              content: t('cluster-overview.tooltips.cpu-used-percentage', {
                percentage: cpu.percentage,
              }),
              position: 'bottom',
            }}
          />
        </>
      ) : (
        EMPTY_TEXT_PLACEHOLDER
      ),
      memory ? (
        <ProgressIndicatorWithPercentage
          leftTitle={memory.percentage}
          value={memory.percentageValue}
          tooltip={{
            content: t('cluster-overview.tooltips.memory-used-percentage', {
              percentage: memory.percentage,
            }),
            position: 'bottom',
          }}
          dataBarColor="var(--sapChart_Good)"
        />
      ) : (
        EMPTY_TEXT_PLACEHOLDER
      ),
      <ReadableCreationTimestamp
        timestamp={entry.metadata?.creationTimestamp}
      />,
      getStatus(entry.status),
      entry.metadata?.labels?.['worker.gardener.cloud/pool'] ??
        EMPTY_TEXT_PLACEHOLDER,
      entry.metadata?.labels?.['node.kubernetes.io/instance-type'] ??
        EMPTY_TEXT_PLACEHOLDER,
      entry?.metadata?.labels?.['topology.kubernetes.io/zone'] ??
        EMPTY_TEXT_PLACEHOLDER,
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
          serverDataError={error}
          serverDataLoading={!data && loading}
          pagination={{ autoHide: true }}
          testid="cluster-nodes"
          searchSettings={{
            showSearchField: false,
            allowSlashShortcut: false,
          }}
          hasDetailsView
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
