import { ErrorPanel } from 'shared/components/ErrorPanel/ErrorPanel';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useNodesQuery } from 'components/Nodes/nodeQueries';
import { EventsList } from 'shared/components/EventsList';
import { EVENT_MESSAGE_TYPE } from 'hooks/useMessageList';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { ProgressBar } from 'shared/components/ProgressBar/ProgressBar';
import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';

import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { useUrl } from 'hooks/useUrl';

import { spacing } from '@ui5/webcomponents-react-base';
import './ClusterNodes.scss';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { CircleProgress } from 'shared/components/CircleProgress/CircleProgress';

const NodeHeader = ({ nodeName }) => {
  const { clusterUrl } = useUrl();
  return (
    <Link className="bsl-link" to={clusterUrl(`overview/nodes/${nodeName}`)}>
      {nodeName}
    </Link>
  );
};

export function ClusterNodes() {
  const { t } = useTranslation();

  const {
    nodes,
    error: nodesDataError,
    loading: nodesDataLoading,
  } = useNodesQuery();

  const data = nodes;
  const error = nodesDataError;
  const loading = nodesDataLoading;

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

  const cpu = { usage: 5, capacity: 10 };
  const memory = { usage: 6, capacity: 9 };

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
      <div
        className="cluster-overview__graphs-wrapper"
        style={spacing.sapUiSmallMargin}
      >
        <UI5Panel disableMargin title="CPU Usage">
          <CircleProgress
            color="var(--sapIndicationColor_7)"
            value={cpu.usage}
            max={cpu.capacity}
            title={t('machine-info.cpu-m')}
            reversed={true}
            tooltip={{
              content: `${t('machine-info.cpu-usage')} ${cpu.percentage}`,
              position: 'right',
            }}
          />
        </UI5Panel>
        <UI5Panel disableMargin title="Memory Usage">
          <CircleProgress
            color="var(--sapIndicationColor_6)"
            value={memory.usage}
            max={memory.capacity}
            title={t('machine-info.memory-gib')}
            reversed={true}
            tooltip={{
              content: `${t('machine-info.memory-usage')} ${memory.percentage}`,
              position: 'right',
            }}
          />
        </UI5Panel>
        <UI5Panel disableMargin title="Test"></UI5Panel>
      </div>
      {Events}
    </>
  );
}
