import { useTranslation } from 'react-i18next';

import { Card, CardHeader } from '@ui5/webcomponents-react';
import {
  calculateMetrics,
  usePodsMetricsQuery,
} from 'resources/Pods/podQueries';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { ResourceRadialChart } from 'shared/components/ResourceRadialChart/ResourceRadialChart';

export const ResourcesUsage = ({ namespace }: { namespace?: string }) => {
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
        <ResourceRadialChart
          tooltipInfo={t('cluster-overview.statistics.cpu-usage-tooltip')}
          cardClassName="item"
          color="var(--sapChart_OrderedColor_5)"
          value={cpu.usage}
          max={cpu.capacity}
          valueType="cpu"
          titleText={t('cluster-overview.statistics.cpu-usage')}
          accessibleName={t('cluster-overview.statistics.cpu-usage')}
        />
      </div>
      <div className="item-wrapper card-tall">
        <ResourceRadialChart
          tooltipInfo={t('cluster-overview.statistics.memory-usage-tooltip')}
          cardClassName="item"
          color="var(--sapChart_OrderedColor_6)"
          value={memory.usage}
          max={memory.capacity}
          titleText={t('cluster-overview.statistics.memory-usage')}
          valueType="bytes"
          unit="Mi"
          accessibleName={t('cluster-overview.statistics.memory-usage')}
        />
      </div>
    </>
  );
};
