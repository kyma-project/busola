import { spacing } from '@ui5/webcomponents-react-base';
import { useTranslation } from 'react-i18next';
import { UI5RadialChart } from 'shared/components/UI5RadialChart/UI5RadialChart';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';

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
    <div
      className="cluster-overview__graphs-wrapper"
      style={spacing.sapUiSmallMargin}
    >
      <UI5Panel
        disableMargin
        title={t('cluster-overview.statistics.cpu-usage-m')}
      >
        <UI5RadialChart
          color="var(--sapIndicationColor_7)"
          value={roundDecimals(cpu.usage)}
          max={roundDecimals(cpu.capacity)}
          tooltip={{
            content: t('cluster-overview.tooltips.cpu-used', {
              value: roundDecimals(cpu.usage),
              max: roundDecimals(cpu.capacity),
            }),
            position: 'bottom',
          }}
        />
      </UI5Panel>
      <UI5Panel
        disableMargin
        title={t('cluster-overview.statistics.memory-usage-gib')}
      >
        <UI5RadialChart
          color="var(--sapIndicationColor_6)"
          value={roundDecimals(memory.usage)}
          max={roundDecimals(memory.capacity)}
          tooltip={{
            content: t('cluster-overview.tooltips.memory-used', {
              value: roundDecimals(memory.usage),
              max: roundDecimals(memory.capacity),
            }),
            position: 'bottom',
          }}
        />
      </UI5Panel>
    </div>
  );
}

function roundDecimals(number) {
  return parseFloat(number.toFixed(2));
}
