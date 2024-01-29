import { spacing } from '@ui5/webcomponents-react-base';
import { useTranslation } from 'react-i18next';
import { UI5RadialChart } from 'shared/components/UI5RadialChart/UI5RadialChart';
import { Card, CardHeader, Title } from '@ui5/webcomponents-react';
import { CountingCard } from 'shared/components/CountingCard/CountingCard';
import { ProgressIndicatorWithPercentage } from 'shared/components/ProgressIndicatorWithPercentage/ProgressIndicatorWithPercentage';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import {
  getHealthyReplicasCount,
  getHealthyStatusesCount,
} from 'resources/Namespaces/NamespaceWorkloads/NamespaceWorkloadsHelpers';

export default function ClusterStats({ data }) {
  const { t } = useTranslation();

  let cpu = { usage: 0, capacity: 0 };
  let memory = { usage: 0, capacity: 0 };

  for (const node of data) {
    cpu.usage += node.metrics.cpu?.usage ?? 0;
    cpu.capacity += node.metrics.cpu?.capacity ?? 0;
    memory.usage += node.metrics.memory?.usage ?? 0;
    memory.capacity += node.metrics.memory?.capacity ?? 0;
  }

  const { data: podsData } = useGetList()(`/api/v1/pods`, {
    pollingInterval: 3200,
  });

  const { data: deploymentsData } = useGetList()('/apis/apps/v1/deployments', {
    pollingInterval: 3200,
  });

  const healthyPods = getHealthyStatusesCount(podsData);
  const healthyDeployments = getHealthyReplicasCount(deploymentsData);

  const calculatePercents = (value, max) => {
    return max !== 0 ? parseFloat(((value / max) * 100).toFixed(2)) : 0.0;
  };

  const healthyPodsPercent = calculatePercents(healthyPods, podsData?.length);
  const healthyDeploymentsPercent = calculatePercents(
    healthyDeployments,
    deploymentsData?.length,
  );
  return (
    <>
      <Title
        level="H4"
        style={{
          ...spacing.sapUiMediumMarginBegin,
          ...spacing.sapUiMediumMarginTop,
          ...spacing.sapUiSmallMarginBottom,
        }}
      >
        {t('cluster-overview.statistics.title')}
      </Title>
      <div
        className="cluster-overview__graphs-wrapper"
        style={spacing.sapUiSmallMarginBeginEnd}
      >
        <Card
          className="cluster-overview__radial-chart-container"
          header={
            <CardHeader
              titleText={t('cluster-overview.statistics.cpu-usage')}
            />
          }
        >
          <UI5RadialChart
            className="cluster-overview__radial-chart"
            color="var(--sapChart_Bad)"
            value={roundDecimals(cpu.usage)}
            max={roundDecimals(cpu.capacity)}
            tooltip={{
              content: t('cluster-overview.tooltips.cpu-used-m', {
                value: roundDecimals(cpu.usage),
                max: roundDecimals(cpu.capacity),
              }),
              position: 'bottom',
            }}
          />
        </Card>
        <Card
          className="cluster-overview__radial-chart-container"
          header={
            <CardHeader
              titleText={t('cluster-overview.statistics.memory-usage')}
            />
          }
        >
          <UI5RadialChart
            className="cluster-overview__radial-chart"
            color="var(--sapChart_Good)"
            value={roundDecimals(memory.usage)}
            max={roundDecimals(memory.capacity)}
            tooltip={{
              content: t('cluster-overview.tooltips.memory-used-gib', {
                value: roundDecimals(memory.usage),
                max: roundDecimals(memory.capacity),
              }),
              position: 'bottom',
            }}
          />
        </Card>
        {(podsData || deploymentsData) && (
          <Card
            className="cluster-overview__prograss-chart"
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
                  rightTitle={String(healthyPodsPercent) + '%'}
                  value={healthyPodsPercent}
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
                  leftTitle={t(
                    'cluster-overview.statistics.healthy-deployments',
                  )}
                  rightTitle={String(healthyDeploymentsPercent) + '%'}
                  value={healthyDeploymentsPercent}
                  dataBarColor={'var(--sapIndicationColor_6)'}
                  remainingBarColor={'var(--sapIndicationColor_6b)'}
                  tooltip={{
                    content: t(
                      'cluster-overview.tooltips.healthy-deployments',
                      {
                        value: healthyDeployments,
                        max: deploymentsData?.length,
                      },
                    ),
                    position: 'bottom',
                  }}
                />
              )}
            </div>
          </Card>
        )}
      </div>
      <div
        className="cluster-overview__graphs-wrapper"
        style={spacing.sapUiSmallMargin}
      >
        {data && (
          <CountingCard
            value={data?.length}
            title={t('cluster-overview.statistics.nodes')}
          />
        )}
        {podsData && (
          <CountingCard
            value={podsData?.length}
            title={t('cluster-overview.statistics.pods')}
          />
        )}
        {deploymentsData && (
          <CountingCard
            value={deploymentsData?.length}
            title={t('cluster-overview.statistics.deployments')}
          />
        )}
      </div>
    </>
  );
}

function roundDecimals(number) {
  return parseFloat(number.toFixed(2));
}
