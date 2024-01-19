import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

import { UI5RadialChart } from 'shared/components/UI5RadialChart/UI5RadialChart';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { useUrl } from 'hooks/useUrl';

import {
  getHealthyStatusesCount,
  getHealthyReplicasCount,
} from './NamespaceWorkloadsHelpers';
import { Icon } from '@ui5/webcomponents-react';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { CardWithTooltip } from 'shared/components/CardWithTooltip/CardWithTooltip';
import { ProgressIndicatorWithPercentage } from 'shared/components/ProgressIndicatorWithPercentage/ProgressIndicatorWithPercentage';
import { spacing } from '@ui5/webcomponents-react-base';

NamespaceWorkloads.propTypes = { namespace: PropTypes.string.isRequired };

const ResourceCircle = ({
  data,
  counter,
  loading,
  error,
  resourceType,
  color,
  onClick,
}) => {
  const { t } = useTranslation();

  const tooltipContent = (value, total, resourceType) => {
    if (total === 0) {
      return t('namespaces.tooltips.no-resources', {
        resourceType: resourceType,
      });
    } else {
      return t('namespaces.tooltips.healthy-resources', {
        value: value,
        total: total,
        resourceType: resourceType,
      });
    }
  };

  if (error) {
    return (
      <p>
        {t('namespaces.overview.workloads.error', {
          title: resourceType,
          message: error.message,
        })}
      </p>
    );
  } else if (loading || !data) {
    return <Spinner />;
  }

  return (
    <UI5RadialChart
      onClick={onClick}
      color={color}
      value={counter(data)}
      max={data.length}
      title={resourceType}
      tooltip={{
        content: tooltipContent(counter(data), data.length, resourceType),
        position: 'bottom',
      }}
    />
  );
};

const PodsCircle = ({ namespace }) => {
  const { t } = useTranslation();
  const { namespaceUrl } = useUrl();
  const navigate = useNavigate();

  const { data, error, loading = true } = useGetList()(
    namespace ? `/api/v1/namespaces/${namespace}/pods` : '/api/v1/pods',
    {
      pollingInterval: 3100,
    },
  );
  return (
    <ResourceCircle
      onClick={() => navigate(namespaceUrl('pods'))}
      data={data}
      counter={getHealthyStatusesCount}
      loading={loading}
      error={error}
      resourceType={t('namespaces.overview.workloads.pods')}
      color="var(--sapIndicationColor_5)"
    />
  );
};

const DeploymentsCircle = ({ namespace }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { namespaceUrl } = useUrl();
  const { data, error, loading = true } = useGetList()(
    namespace
      ? `/apis/apps/v1/namespaces/${namespace}/deployments`
      : '/apis/apps/v1/deployments',
    {
      pollingInterval: 3200,
    },
  );
  return (
    <ResourceCircle
      onClick={() => navigate(namespaceUrl('deployments'))}
      data={data}
      counter={getHealthyReplicasCount}
      loading={loading}
      error={error}
      resourceType={t('namespaces.overview.workloads.deployments')}
      color="var(--sapIndicationColor_6)"
    />
  );
};

export function NamespaceWorkloads({ namespace }) {
  const { t } = useTranslation();

  const { data: podsData } = useGetList()(`/api/v1/pods`, {
    pollingInterval: 3200,
  });

  const { data: deploymentsData } = useGetList()('/apis/apps/v1/deployments', {
    pollingInterval: 3200,
  });

  const healthyPods = getHealthyStatusesCount(podsData);
  const healthyDeployments = getHealthyReplicasCount(deploymentsData);

  const calculatePercents = (value, max) => {
    return parseFloat(((value / max) * 100).toFixed(2));
  };

  return (
    <UI5Panel
      disableMargin
      icon={
        <Icon
          className="bsl-icon-m"
          name="stethoscope"
          aria-label="Health icon"
        />
      }
      title={t('namespaces.overview.workloads.title')}
    >
      <div
        className="namespaceWorkloads_content"
        style={{
          ...spacing.sapUiTinyMarginTop,
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
        }}
      >
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
    </UI5Panel>
  );
}
