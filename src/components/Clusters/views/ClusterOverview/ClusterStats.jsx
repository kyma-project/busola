import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';

import { UI5RadialChart } from 'shared/components/UI5RadialChart/UI5RadialChart';
import { Title } from '@ui5/webcomponents-react';
import { CountingCard } from 'shared/components/CountingCard/CountingCard';
import {
  bytesToHumanReadable,
  cpusToHumanReadable,
  getBytes,
} from 'shared/helpers/resources';
import {
  getHealthyDaemonsets,
  getHealthyReplicasCount,
  getStatusesPodCount,
  PodStatusCounterKey,
} from 'resources/Namespaces/NamespaceWorkloads/NamespaceWorkloadsHelpers';

import './ClusterStats.scss';
import { getAvailableNvidiaGPUs } from 'components/Nodes/nodeHelpers';

const Injections = React.lazy(
  () => import('../../../Extensibility/ExtensibilityInjections'),
);

export default function ClusterStats({ nodesData }) {
  const { t } = useTranslation();

  const cpu = { usage: 0, capacity: 0 };
  const memory = { usage: 0, capacity: 0 };

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

  const pvCapacity = useMemo(() => {
    if (persistentVolumesData) {
      let total_bytes_capacity = 0;
      for (const pv of persistentVolumesData) {
        total_bytes_capacity += getBytes(pv?.spec?.capacity?.storage);
      }
      return bytesToHumanReadable(total_bytes_capacity).string;
    }
    return 0;
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

  const loadbalancerNumber = useMemo(() => {
    if (servicesData) {
      let loadbalancers = 0;
      for (const sv of servicesData) {
        if (sv?.spec?.type === 'LoadBalancer') {
          loadbalancers++;
        }
      }
      return loadbalancers;
    }
    return 0;
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
  const gpus = getAvailableNvidiaGPUs(nodesData);

  return (
    <section aria-labelledby="monitoring-heading">
      <Title
        level="H3"
        size="H3"
        className="sap-margin-begin-medium sap-margin-y-medium"
        id="monitoring-heading"
      >
        {t('common.headers.monitoring-and-health')}
      </Title>
      <div className="cluster-stats sap-margin-x-tiny">
        <div className="item-wrapper card-tall">
          <UI5RadialChart
            cardClassName="item"
            color="var(--sapChart_OrderedColor_5)"
            value={
              cpusToHumanReadable(cpu.usage, {
                unit: 'm',
              }).value
            }
            max={
              cpusToHumanReadable(cpu.capacity, {
                unit: 'm',
              }).value
            }
            titleText={t('cluster-overview.statistics.cpu-usage')}
            additionalInfo={`${
              cpusToHumanReadable(cpu.usage, {
                unit: 'm',
              }).string
            } / ${
              cpusToHumanReadable(cpu.capacity, {
                unit: 'm',
              }).string
            }`}
            accessibleName={t('cluster-overview.statistics.cpu-usage')}
          />
        </div>
        <div className="item-wrapper card-tall">
          <UI5RadialChart
            cardClassName="item"
            color="var(--sapChart_OrderedColor_6)"
            value={bytesToHumanReadable(memory.usage, { unit: 'Mi' }).value}
            max={bytesToHumanReadable(memory.capacity, { unit: 'Mi' }).value}
            titleText={t('cluster-overview.statistics.memory-usage')}
            additionalInfo={`${bytesToHumanReadable(memory.usage).string} / ${
              bytesToHumanReadable(memory.capacity).string
            }`}
            accessibleName={t('cluster-overview.statistics.memory-usage')}
          />
        </div>
        {nodesData && (
          <div className="item-wrapper card-small">
            <CountingCard
              className="item"
              value={nodesData?.length}
              title={t('cluster-overview.statistics.nodes')}
              extraInfo={[
                gpus > 0
                  ? {
                      title: t('cluster-overview.statistics.nvidia-gpus'),
                      value: gpus,
                    }
                  : null,
              ]}
            />
          </div>
        )}
        {podsData && (
          <div className="item-wrapper card-wide">
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
          <div className="item-wrapper card-wide">
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
          <div className="item-wrapper card-wide">
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
          <div className="item-wrapper card-wide">
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
          <div className="item-wrapper card-wide">
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
          <div className="item-wrapper card-wide">
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
    </section>
  );
}
