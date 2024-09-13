import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { useGetList } from 'shared/hooks/BackendAPI/useGet';

import {
  getHealthyDaemonsets,
  getHealthyReplicasCount,
  getStatusesPodCount,
  PodStatusCounterKey,
} from './NamespaceWorkloadsHelpers';
import { CountingCard } from 'shared/components/CountingCard/CountingCard';
import { useEffect, useState } from 'react';

NamespaceWorkloads.propTypes = { namespace: PropTypes.string };

export function NamespaceWorkloads({ namespace }) {
  const { t } = useTranslation();

  const { data: podsData } = useGetList()(
    namespace ? `/api/v1/namespaces/${namespace}/pods` : `/api/v1/pods`,
    {
      pollingInterval: 3200,
    },
  );

  const { data: deploymentsData } = useGetList()(
    namespace
      ? `/apis/apps/v1/namespaces/${namespace}/deployments`
      : `/apis/apps/v1/deployments`,
    {
      pollingInterval: 3200,
    },
  );

  const { data: daemonsetsData } = useGetList()(
    namespace
      ? `/apis/apps/v1/namespaces/${namespace}/daemonsets`
      : `/apis/apps/v1/daemonsets`,
    {
      pollingInterval: 3200,
    },
  );

  const { data: statefulsetsData } = useGetList()(
    namespace
      ? `/apis/apps/v1/namespaces/${namespace}/statefulsets`
      : `/apis/apps/v1/statefulsets`,
    {
      pollingInterval: 3200,
    },
  );

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

  const { data: servicesData } = useGetList()(
    namespace ? `/api/v1/namespaces/${namespace}/services` : `/api/v1/services`,
    {
      pollingInterval: 3200,
    },
  );

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

  return (
    <>
      {(podsData || deploymentsData) && (
        <>
          {podsData && (
            <div className="item-wrapper wide">
              <CountingCard
                className="item"
                value={podsData?.length}
                title={t('cluster-overview.statistics.pods-overview')}
                subTitle={t('cluster-overview.statistics.total-pods')}
                resourceUrl="pods"
                allNamespaceURL={false}
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
                allNamespaceURL={false}
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
                    title: t(
                      'cluster-overview.statistics.unhealthy-daemonsets',
                    ),
                    value: daemonsetsData?.length - healthyDaemonsets,
                  },
                ]}
                allNamespaceURL={false}
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
                    title: t(
                      'cluster-overview.statistics.healthy-statefulsets',
                    ),
                    value: healthyStatefulsets,
                  },
                  {
                    title: t(
                      'cluster-overview.statistics.unhealthy-statefulsets',
                    ),
                    value: statefulsetsData?.length - healthyStatefulsets,
                  },
                ]}
                allNamespaceURL={false}
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
                allNamespaceURL={false}
                resourceUrl="services"
              />
            </div>
          )}
        </>
      )}
    </>
  );
}
