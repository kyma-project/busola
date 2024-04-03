import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { useGetList } from 'shared/hooks/BackendAPI/useGet';

import {
  getHealthyReplicasCount,
  getHealthyStatusesCount,
} from './NamespaceWorkloadsHelpers';
import { ProgressIndicatorWithPercentage } from 'shared/components/ProgressIndicatorWithPercentage/ProgressIndicatorWithPercentage';
import { Card, CardHeader } from '@ui5/webcomponents-react';
import { spacing } from '@ui5/webcomponents-react-base';

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

  const healthyPods = getHealthyStatusesCount(podsData);
  const healthyDeployments = getHealthyReplicasCount(deploymentsData);

  const calculatePercents = (value, max) => {
    return max !== 0 ? parseFloat(((value / max) * 100).toFixed(2)) : 0.0;
  };

  const healthyDeploymentPercents = calculatePercents(
    healthyDeployments,
    deploymentsData?.length,
  );

  const healthyPodsPercents = calculatePercents(healthyPods, podsData?.length);
  return (
    <>
      {(podsData || deploymentsData) && (
        <Card
          className="progress-chart-card"
          header={
            <CardHeader
              titleText={t('cluster-overview.statistics.namespaces-health')}
            />
          }
        >
          <div style={spacing.sapUiSmallMargin}>
            {podsData && (
              <ProgressIndicatorWithPercentage
                leftTitle={t('cluster-overview.statistics.healthy-pods')}
                rightTitle={String(healthyPodsPercents) + '%'}
                value={healthyPodsPercents}
                dataBarColor={'var(--sapIndicationColor_8)'}
                remainingBarColor={'var(--sapIndicationColor_8b)'}
                tooltip={{
                  content: t('cluster-overview.tooltips.healthy-pods', {
                    value: healthyPods,
                    max: podsData?.length,
                  }),
                  position: 'bottom',
                }}
              />
            )}
            {deploymentsData && (
              <ProgressIndicatorWithPercentage
                leftTitle={t('cluster-overview.statistics.healthy-deployments')}
                rightTitle={String(healthyDeploymentPercents) + '%'}
                value={healthyDeploymentPercents}
                dataBarColor={'var(--sapIndicationColor_6)'}
                remainingBarColor={'var(--sapIndicationColor_6b)'}
                tooltip={{
                  content: t('cluster-overview.tooltips.healthy-deployments', {
                    value: healthyDeployments,
                    max: deploymentsData?.length,
                  }),
                  position: 'bottom',
                }}
              />
            )}
          </div>
        </Card>
      )}
    </>
  );
}
