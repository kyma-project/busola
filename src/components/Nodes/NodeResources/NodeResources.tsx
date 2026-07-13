import { useTranslation } from 'react-i18next';
import { ResourceRadialChart } from 'shared/components/ResourceRadialChart/ResourceRadialChart';

interface ResourceMetric {
  usage: number;
  capacity: number;
  percentage: string;
  percentageValue: number;
}

interface ResourceUsage {
  cpu?: number;
  memory?: number;
}

interface NodeResourcesProps {
  metrics?: {
    cpu?: ResourceMetric;
    memory?: ResourceMetric;
  };
  resources?: {
    requests?: ResourceUsage;
    limits?: ResourceUsage;
  } | null;
}

export function NodeResources({ metrics, resources }: NodeResourcesProps) {
  const { t } = useTranslation();
  const { cpu, memory } = metrics || {};

  return cpu && memory ? (
    <>
      <ResourceRadialChart
        tooltipInfo={t('cluster-overview.statistics.cpu-usage-tooltip')}
        color="var(--sapChart_OrderedColor_5)"
        value={cpu.usage}
        max={cpu.capacity}
        titleText={t('cluster-overview.statistics.cpu-usage')}
        valueType="cpu"
        accessibleName={t('cluster-overview.statistics.cpu-usage')}
      />
      <ResourceRadialChart
        tooltipInfo={t('cluster-overview.statistics.memory-usage-tooltip')}
        color="var(--sapChart_OrderedColor_6)"
        value={memory.usage}
        max={memory.capacity}
        valueType="bytes"
        titleText={t('cluster-overview.statistics.memory-usage')}
        unit="Mi"
        accessibleName={t('cluster-overview.statistics.memory-usage')}
      />
      <ResourceRadialChart
        tooltipInfo={t('cluster-overview.statistics.cpu-requests-tooltip')}
        color="var(--sapChart_OrderedColor_5)"
        value={resources?.requests?.cpu || 0}
        max={cpu.capacity}
        valueType="cpu"
        titleText={t('cluster-overview.statistics.cpu-requests')}
        accessibleName={t('cluster-overview.statistics.cpu-requests')}
      />
      <ResourceRadialChart
        tooltipInfo={t('cluster-overview.statistics.memory-requests-tooltip')}
        color="var(--sapChart_OrderedColor_6)"
        value={resources?.requests?.memory || 0}
        max={memory.capacity}
        valueType="bytes"
        unit="Gi"
        titleText={t('cluster-overview.statistics.memory-requests')}
        accessibleName={t('cluster-overview.statistics.memory-requests')}
      />
      <ResourceRadialChart
        tooltipInfo={t('cluster-overview.statistics.cpu-limits-tooltip')}
        color="var(--sapChart_OrderedColor_5)"
        value={resources?.limits?.cpu || 0}
        max={cpu.capacity}
        valueType="cpu"
        titleText={t('cluster-overview.statistics.cpu-limits')}
        accessibleName={t('cluster-overview.statistics.cpu-limits')}
      />
      <ResourceRadialChart
        tooltipInfo={t('cluster-overview.statistics.memory-limits-tooltip')}
        color="var(--sapChart_OrderedColor_6)"
        value={resources?.limits?.memory || 0}
        max={memory.capacity}
        valueType="bytes"
        unit="Gi"
        titleText={t('cluster-overview.statistics.memory-limits')}
        accessibleName={t('cluster-overview.statistics.memory-limits')}
      />
    </>
  ) : (
    t('components.error-panel.error')
  );
}
