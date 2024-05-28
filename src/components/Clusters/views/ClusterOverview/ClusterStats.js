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
  getHealthyDaemonsets,
  getHealthyReplicasCount,
  getHealthyStatusesCount,
} from 'resources/Namespaces/NamespaceWorkloads/NamespaceWorkloadsHelpers';
import { roundTwoDecimals } from 'shared/utils/helpers';
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
  const { data: statefulsetsData } = useGetList()(
    '/apis/apps/v1/statefulsets',
    {
      pollingInterval: 3200,
    },
  );

  const { data: servicesData } = useGetList()('/api/v1/services', {
    pollingInterval: 3200,
  });
  const [loadbalancerNumber, setLoadbalancerNumber] = useState(0);

  useEffect(() => {
    if (servicesData) {
      let loadbalancers = 0;
      for (const sv of servicesData) {
        if (sv?.spec?.type === 'LoadBalancer') {
          loadbalancers++;
        }
      }
      setLoadbalancerNumber(loadbalancers);
    }
  }, [servicesData]);

  const healthyPods = getHealthyStatusesCount(podsData);
  const healthyDeployments = getHealthyReplicasCount(deploymentsData);
  const healthyDaemonsets = getHealthyDaemonsets(daemonsetsData);
  const healthyStatefulsets = getHealthyReplicasCount(statefulsetsData);

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
            value={roundTwoDecimals(cpu.usage)}
            max={roundTwoDecimals(cpu.capacity)}
            additionalInfo={`${roundTwoDecimals(
              cpu.usage,
            )}m / ${roundTwoDecimals(cpu.capacity)}m`}
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
            value={roundTwoDecimals(memory.usage)}
            max={roundTwoDecimals(memory.capacity)}
            additionalInfo={`${roundTwoDecimals(
              memory.usage,
            )}GiB / ${roundTwoDecimals(memory.capacity)}GiB`}
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
        {nodesData && (
          <CountingCard
            value={nodesData?.length}
            title={t('cluster-overview.statistics.nodes')}
          />
        )}
        {daemonsetsData && (
          <CountingCard
            value={daemonsetsData?.length}
            title="DaemonSets Overview"
            subTitle="Total DaemonSets"
            extraInfo={[
              { title: 'Healthy DaemonSets', value: healthyDaemonsets },
              {
                title: 'Unhealthy DaemonSets',
                value: daemonsetsData?.length - healthyDaemonsets,
              },
            ]}
            resourceUrl="daemonsets"
          />
        )}
        {statefulsetsData && (
          <CountingCard
            value={statefulsetsData?.length}
            title="StatefulSets Overview"
            subTitle="Total StatefulSets"
            extraInfo={[
              { title: 'Healthy StatefulSets', value: healthyStatefulsets },
              {
                title: 'Unhealthy StatefulSets',
                value: statefulsetsData?.length - healthyStatefulsets,
              },
            ]}
            resourceUrl="statefulsets"
          />
        )}
        {servicesData && (
          <CountingCard
            value={servicesData?.length}
            title="Services Overview"
            subTitle="Total Services"
            extraInfo={[
              { title: 'LoadBalancers', value: loadbalancerNumber },
              {
                title: 'Other',
                value: servicesData?.length - loadbalancerNumber,
              },
            ]}
            resourceUrl="services"
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
        <Injections destination="ClusterStats" slot="cards" root="" />
      </div>
    </>
  );
}
