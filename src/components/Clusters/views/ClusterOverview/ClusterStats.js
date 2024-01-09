import { spacing } from '@ui5/webcomponents-react-base';
import { useTranslation } from 'react-i18next';
import { UI5RadialChart } from 'shared/components/UI5RadialChart/UI5RadialChart';
import { Card, CardHeader, Title } from '@ui5/webcomponents-react';
import { CountingCard } from 'shared/components/CountingCard/CountingCard';
import { CardWithTooltip } from 'shared/components/CardWithTooltip/CardWithTooltip';
import { ProgressIndicatorWithPercentage } from 'shared/components/ProgressIndicatorWithPercentage/ProgressIndicatorWithPercentage';

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
          header={
            <CardHeader
              titleText={t('cluster-overview.statistics.cpu-usage')}
            />
          }
        >
          <UI5RadialChart
            color="var(--sapIndicationColor_7)"
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
          header={
            <CardHeader
              titleText={t('cluster-overview.statistics.memory-usage')}
            />
          }
        >
          <UI5RadialChart
            color="var(--sapIndicationColor_6)"
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
        <CardWithTooltip
          title="Something"
          tooltip={{
            content: 'Info',
            position: 'bottom',
          }}
          icon={'sys-help'}
        >
          <ProgressIndicatorWithPercentage
            title={'Something 1'}
            tooltip={{
              content: t('cluster-overview.tooltips.memory-used-percentage', {
                percentage: 50,
              }),
              position: 'bottom',
            }}
            value={50}
          />
          <ProgressIndicatorWithPercentage
            title={'Something 2'}
            tooltip={{
              content: t('cluster-overview.tooltips.memory-used-percentage', {
                percentage: 34,
              }),
              position: 'bottom',
            }}
            value={34}
          />
          <ProgressIndicatorWithPercentage
            title={'Something 3'}
            tooltip={{
              content: t('cluster-overview.tooltips.memory-used-percentage', {
                percentage: 71,
              }),
              position: 'bottom',
            }}
            value={71}
          />
        </CardWithTooltip>
      </div>
      <div
        className="cluster-overview__cards-wrapper"
        style={spacing.sapUiSmallMargin}
      >
        <CountingCard value={60} title="Something" />
        <CountingCard value={71} title="Something 2" />
        <CountingCard value={45} title="Something 3" />
        <CountingCard value={67} title="Something 4" />
        <CountingCard value={24} title="Something 5" />
      </div>
    </>
  );
}

function roundDecimals(number) {
  return parseFloat(number.toFixed(2));
}
