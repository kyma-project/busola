import { ErrorPanel } from 'shared/components/ErrorPanel/ErrorPanel';
import { Link } from 'shared/components/Link/Link';
import { useTranslation } from 'react-i18next';

import { EventsList } from 'shared/components/EventsList';
import { EVENT_MESSAGE_TYPE } from 'hooks/useMessageList';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';

import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { useUrl } from 'hooks/useUrl';
import { ProgressIndicatorWithPercentage } from 'shared/components/ProgressIndicatorWithPercentage/ProgressIndicatorWithPercentage';

const NodeHeader = ({ nodeName }) => {
  const { clusterUrl } = useUrl();
  return (
    <Link url={clusterUrl(`overview/nodes/${nodeName}`)} resetLayout={false}>
      {nodeName}
    </Link>
  );
};

export function ClusterNodes({ data, error, loading }) {
  const { t } = useTranslation();

  const getStatusType = status => {
    if (status === 'Ready') return 'Success';
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
          serverDataError={error}
          serverDataLoading={!data && loading}
          pagination={{ autoHide: true }}
          testid="cluster-nodes"
          searchSettings={{
            showSearchField: false,
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
      {Events}
    </>
  );
}
