import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { useGetList } from 'shared/hooks/BackendAPI/useGet';

import {
  getHealthyReplicasCount,
  getHealthyStatusesCount,
} from './NamespaceWorkloadsHelpers';
import { CountingCard } from 'shared/components/CountingCard/CountingCard';

NamespaceWorkloads.propTypes = { namespace: PropTypes.string.isRequired };

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

  const healthyPods = getHealthyStatusesCount(podsData);
  const healthyDeployments = getHealthyReplicasCount(deploymentsData);

  return (
    <>
      {(podsData || deploymentsData) && (
        <div className="counting-cards-container">
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
              title={t('cluster-overview.statistics.deployments')}
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
        </div>
      )}
    </>
  );
}
