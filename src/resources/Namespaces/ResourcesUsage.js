import { UI5RadialChart } from 'shared/components/UI5RadialChart/UI5RadialChart';
import { useTranslation } from 'react-i18next';

import {
  bytesToHumanReadable,
  cpusToHumanReadable,
} from 'shared/helpers/resources';
import { Card, CardHeader } from '@ui5/webcomponents-react';
import {
  calculateMetrics,
  usePodsMetricsQuery,
} from 'resources/Pods/podQueries';
import { Spinner } from 'shared/components/Spinner/Spinner';

export const ResourcesUsage = ({ namespace }) => {
  const { t } = useTranslation();
  const { podsMetrics, error, loading } = usePodsMetricsQuery(namespace);
  const { cpu, memory } = calculateMetrics(podsMetrics);

  if (loading) {
    return <Spinner />;
  } else if (error) {
    return (
      <div className="item-wrapper card-small pods-metrics-error">
        <Card
          accessibleName={t('namespaces.overview.resources.error')}
          className="item"
          header={
            <CardHeader titleText={t('namespaces.overview.resources.error')} />
          }
        />
      </div>
    );
  } else if (!podsMetrics?.length) return null;

  return (
    <>
      <div className="item-wrapper card-tall">
        <Card
          accessibleName={t('cluster-overview.statistics.cpu-usage')}
          className="radial-chart-card item"
          header={
            <CardHeader
              titleText={t('cluster-overview.statistics.cpu-usage')}
            />
          }
        >
          <UI5RadialChart
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
            additionalInfo={`${
              cpusToHumanReadable(cpu.usage, {
                unit: 'm',
              }).string
            } / ${
              cpusToHumanReadable(cpu.capacity, {
                unit: 'm',
              }).string
            }`}
          />
        </Card>
      </div>
      <div className="item-wrapper card-tall">
        <Card
          accessibleName={t('cluster-overview.statistics.memory-usage')}
          className="radial-chart-card item"
          header={
            <CardHeader
              titleText={t('cluster-overview.statistics.memory-usage')}
            />
          }
        >
          <UI5RadialChart
            color="var(--sapChart_OrderedColor_6)"
            value={bytesToHumanReadable(memory.usage, { unit: 'Mi' }).value}
            max={bytesToHumanReadable(memory.capacity, { unit: 'Mi' }).value}
            additionalInfo={`${bytesToHumanReadable(memory.usage).string} / ${
              bytesToHumanReadable(memory.capacity).string
            }`}
          />
        </Card>
      </div>
    </>
  );
};
