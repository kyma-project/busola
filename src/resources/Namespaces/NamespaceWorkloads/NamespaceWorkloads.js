import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { useGetList } from 'shared/hooks/BackendAPI/useGet';

import {
  getHealthyStatusesCount,
  getHealthyReplicasCount,
} from './NamespaceWorkloadsHelpers';
import { ProgressIndicatorWithPercentage } from 'shared/components/ProgressIndicatorWithPercentage/ProgressIndicatorWithPercentage';
import { Card, CardHeader } from '@ui5/webcomponents-react';
import { spacing } from '@ui5/webcomponents-react-base';

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

  const calculatePercents = (value, max) => {
    return parseFloat(((value / max) * 100).toFixed(2));
  };

  return (
    <>
      {(podsData || deploymentsData) && (
        <Card
          header={
            <CardHeader
              titleText={t('cluster-overview.statistics.namespaces-health')}
            />
          }
          className="namespace-workloads__body"
        >
          <div style={spacing.sapUiSmallMargin}>
            {podsData && (
              <ProgressIndicatorWithPercentage
                title={t('cluster-overview.statistics.healthy-pods')}
                value={calculatePercents(healthyPods, podsData?.length)}
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
                title={t('cluster-overview.statistics.healthy-deployments')}
                value={calculatePercents(
                  healthyDeployments,
                  deploymentsData?.length,
                )}
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
