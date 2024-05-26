import React, { useEffect, useState } from 'react';
import { spacing } from '@ui5/webcomponents-react-base';
import { useTranslation } from 'react-i18next';
import { UI5RadialChart } from 'shared/components/UI5RadialChart/UI5RadialChart';
import { Card, CardHeader, Title } from '@ui5/webcomponents-react';
import { CountingCard } from 'shared/components/CountingCard/CountingCard';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import {
  bytesToHumanReadable,
  getBytes,
} from 'resources/Namespaces/ResourcesUsage';
import {
  getHealthyReplicasCount,
  getHealthyStatusesCount,
} from 'resources/Namespaces/NamespaceWorkloads/NamespaceWorkloadsHelpers';
import './ClusterStats.scss';

const Injections = React.lazy(() =>
  import('../../../Extensibility/ExtensibilityInjections'),
);

export default function ClusterStats({ nodesData }) {
  const { t } = useTranslation();

  let cpu = { usage: 0, capacity: 0 };
  let memory = { usage: 0, capacity: 0 };

  if (nodesData) {
    for (const node of nodesData) {
      cpu.usage += node.metrics.cpu?.usage ?? 0;
      cpu.capacity += node.metrics.cpu?.capacity ?? 0;
      memory.usage += node.metrics.memory?.usage ?? 0;
      memory.capacity += node.metrics.memory?.capacity ?? 0;
    }
  }

  const { data: podsData } = useGetList()(`/api/v1/pods`, {
    pollingInterval: 3200,
  });

  const { data: deploymentsData } = useGetList()('/apis/apps/v1/deployments', {
    pollingInterval: 3200,
  });

  const { data: persistentVolumesData } = useGetList()(
    '/api/v1/persistentvolumes',
    {
      pollingInterval: 3200,
    },
  );
  const [pvCapacity, setPvCapacity] = useState(0);

  useEffect(() => {
    if (persistentVolumesData) {
      let total_bytes_capacity = 0;
      for (const pv of persistentVolumesData) {
        total_bytes_capacity += getBytes(pv?.spec?.capacity?.storage);
      }
      setPvCapacity(bytesToHumanReadable(total_bytes_capacity));
    }
  }, [persistentVolumesData]);

  const { data: daemonsetsData } = useGetList()('/apis/apps/v1/daemonsets', {
    pollingInterval: 3200,
  });

  const healthyPods = getHealthyStatusesCount(podsData);
  const healthyDeployments = getHealthyReplicasCount(deploymentsData);

  return (
    <>
      <Title
        level="H3"
        style={{
          ...spacing.sapUiMediumMarginBegin,
          ...spacing.sapUiMediumMarginTopBottom,
        }}
      >
        {t('cluster-overview.statistics.title')}
      </Title>
      <div
        className="flexwrap cluster-stats"
        style={spacing.sapUiSmallMarginBeginEnd}
      >
        <Card
          className="radial-chart-card"
          header={
            <CardHeader
              titleText={t('cluster-overview.statistics.cpu-usage')}
            />
          }
        >
          <UI5RadialChart
            color="var(--sapChart_OrderedColor_5)"
            value={roundDecimals(cpu.usage)}
            max={roundDecimals(cpu.capacity)}
            tooltip={{
              content: t('cluster-overview.tooltips.cpu-used-m', {
                value: roundDecimals(cpu.usage),
                max: roundDecimals(cpu.capacity),
              }),
              position: 'bottom',
            }}
            additionalInfo={`${roundDecimals(cpu.usage)}m / ${roundDecimals(
              cpu.capacity,
            )}m`}
          />
        </Card>
        <Card
          className="radial-chart-card"
          header={
            <CardHeader
              titleText={t('cluster-overview.statistics.memory-usage')}
            />
          }
        >
          <UI5RadialChart
            color="var(--sapChart_OrderedColor_6)"
            value={roundDecimals(memory.usage)}
            max={roundDecimals(memory.capacity)}
            tooltip={{
              content: t('cluster-overview.tooltips.memory-used-gib', {
                value: roundDecimals(memory.usage),
                max: roundDecimals(memory.capacity),
              }),
              position: 'bottom',
            }}
            additionalInfo={`${roundDecimals(
              memory.usage,
            )}GiB / ${roundDecimals(memory.capacity)}GiB`}
          />
        </Card>
        {podsData && (
          <CountingCard
            value={podsData?.length}
            title={t('cluster-overview.statistics.pods-overview')}
            subTitle={t('cluster-overview.statistics.total-pods')}
            resourceUrl="pods"
            extraInfo={[
              {
                title: t('cluster-overview.statistics.healthy-pods'),
                value: healthyPods,
              },
              {
                title: t('cluster-overview.statistics.failing-pods'),
                value: podsData.length - healthyPods,
              },
            ]}
          />
        )}
        {deploymentsData && (
          <CountingCard
            value={deploymentsData?.length}
            title={t('cluster-overview.statistics.deployments-overview')}
            subTitle={t('cluster-overview.statistics.total-deployments')}
            resourceUrl="deployments"
            extraInfo={[
              {
                title: t('cluster-overview.statistics.healthy-deployments'),
                value: healthyDeployments,
              },
              {
                title: t('cluster-overview.statistics.failing-deployments'),
                value: deploymentsData.length - healthyDeployments,
              },
            ]}
          />
        )}
        {persistentVolumesData && (
          <CountingCard
            value={persistentVolumesData?.length}
            title="Persistent Volumes Overview"
            subTitle="Total Persistent Volumes"
            resourceUrl="persistentvolumes"
            isClusterResource
            extraInfo={[
              {
                title: 'Total Capacity',
                value: pvCapacity,
              },
            ]}
          />
        )}
        {nodesData && (
          <CountingCard
            value={nodesData?.length}
            title={t('cluster-overview.statistics.nodes')}
          />
        )}
        {daemonsetsData && (
          <CountingCard value={daemonsetsData?.length} title="Daemon Sets" />
        )}
        <Injections destination="ClusterStats" slot="cards" root="" />
      </div>
    </>
  );
}

function roundDecimals(number) {
  return parseFloat(number.toFixed(2));
}
