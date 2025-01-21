import React, { useEffect, useState } from 'react';
import { spacing } from '@ui5/webcomponents-react-base';
import { useTranslation } from 'react-i18next';
import { UI5RadialChart } from 'shared/components/UI5RadialChart/UI5RadialChart';
import { Card, CardHeader, Title } from '@ui5/webcomponents-react';
import { CountingCard } from 'shared/components/CountingCard/CountingCard';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import {
  bytesToHumanReadable,
  cpusToHumanReadable,
  getBytes,
} from 'resources/Namespaces/ResourcesUsage';
import {
  getHealthyDaemonsets,
  getHealthyReplicasCount,
  getStatusesPodCount,
  PodStatusCounterKey,
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

  const statusPodsData = getStatusesPodCount(podsData);
  const healthyPods = statusPodsData.has(PodStatusCounterKey.Healthy)
    ? statusPodsData.get(PodStatusCounterKey.Healthy)
    : 0;
  const pendingPods = statusPodsData.has(PodStatusCounterKey.Pending)
    ? statusPodsData.get(PodStatusCounterKey.Pending)
    : 0;
  const failedPods = statusPodsData.has(PodStatusCounterKey.Failed)
    ? statusPodsData.get(PodStatusCounterKey.Failed)
    : 0;
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
        {t('common.headers.monitoring-and-health')}
      </Title>
      <div className="cluster-stats" style={spacing.sapUiTinyMarginBeginEnd}>
        <div className="item-wrapper tall">
          <Card
            className="radial-chart-card item"
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
              additionalInfo={`${cpusToHumanReadable(cpu.usage, {
                unit: 'm',
              })} / ${cpusToHumanReadable(cpu.capacity, {
                unit: 'm',
              })}`}
            />
          </Card>
        </div>
        <div className="item-wrapper tall">
          <Card
            className="radial-chart-card item"
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
        </div>
        {nodesData && (
          <div className="item-wrapper small">
            <CountingCard
              className="item"
              value={nodesData?.length}
              title={t('cluster-overview.statistics.nodes')}
            />
          </div>
        )}
        {podsData && (
          <div className="item-wrapper wide">
            <CountingCard
              className="item"
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
                  title: t('cluster-overview.statistics.pending-pods'),
                  value: pendingPods,
                },
                {
                  title: t('cluster-overview.statistics.failing-pods'),
                  value: failedPods,
                },
              ]}
            />
          </div>
        )}
        {deploymentsData && (
          <div className="item-wrapper wide">
            <CountingCard
              className="item"
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
          </div>
        )}
        {daemonsetsData && (
          <div className="item-wrapper wide">
            <CountingCard
              className="item"
              value={daemonsetsData?.length}
              title={t('cluster-overview.statistics.daemonsets-overview')}
              subTitle={t('cluster-overview.statistics.total-daemonsets')}
              extraInfo={[
                {
                  title: t('cluster-overview.statistics.healthy-daemonsets'),
                  value: healthyDaemonsets,
                },
                {
                  title: t('cluster-overview.statistics.unhealthy-daemonsets'),
                  value: daemonsetsData?.length - healthyDaemonsets,
                },
              ]}
              resourceUrl="daemonsets"
            />
          </div>
        )}
        {statefulsetsData && (
          <div className="item-wrapper wide">
            <CountingCard
              className="item"
              value={statefulsetsData?.length}
              title={t('cluster-overview.statistics.statefulsets-overview')}
              subTitle={t('cluster-overview.statistics.total-statefulsets')}
              extraInfo={[
                {
                  title: t('cluster-overview.statistics.healthy-statefulsets'),
                  value: healthyStatefulsets,
                },
                {
                  title: t(
                    'cluster-overview.statistics.unhealthy-statefulsets',
                  ),
                  value: statefulsetsData?.length - healthyStatefulsets,
                },
              ]}
              resourceUrl="statefulsets"
            />
          </div>
        )}
        {servicesData && (
          <div className="item-wrapper wide">
            <CountingCard
              className="item"
              value={servicesData?.length}
              title={t('cluster-overview.statistics.services-overview')}
              subTitle={t('cluster-overview.statistics.total-services')}
              extraInfo={[
                {
                  title: t(
                    'cluster-overview.statistics.services-loadbalancers',
                  ),
                  value: loadbalancerNumber,
                },
                {
                  title: t('cluster-overview.statistics.services-others'),
                  value: servicesData?.length - loadbalancerNumber,
                },
              ]}
              resourceUrl="services"
            />
          </div>
        )}
        {persistentVolumesData && (
          <div className="item-wrapper wide">
            <CountingCard
              className="item"
              value={persistentVolumesData?.length}
              title={t(
                'cluster-overview.statistics.persistentvolumes-overview',
              )}
              subTitle={t(
                'cluster-overview.statistics.total-persistentvolumes',
              )}
              resourceUrl="persistentvolumes"
              isClusterResource
              extraInfo={[
                {
                  title: t(
                    'cluster-overview.statistics.persistent-volumes-total-capacity',
                  ),
                  value: pvCapacity,
                },
              ]}
            />
          </div>
        )}
        <Injections destination="ClusterOverview" slot="health" root="" />
      </div>
    </>
  );
}
