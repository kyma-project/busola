import { spacing } from '@ui5/webcomponents-react-base';
import { useTranslation } from 'react-i18next';
import { CircleProgress } from 'shared/components/CircleProgress/CircleProgress';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';

export default function ClusterStats({ data }) {
  const { t } = useTranslation();

  let cpu = { usage: 0, capacity: 0, percentage: 0 };
  let memory = { usage: 0, capacity: 0, percentage: 0 };

  for (const node of data) {
    cpu.usage += node.metrics.cpu?.usage ?? 0;
    cpu.capacity += node.metrics.cpu?.capacity ?? 0;
    memory.usage += node.metrics.memory?.usage ?? 0;
    memory.capacity += node.metrics.memory?.capacity ?? 0;
  }
  cpu.percentage = roundDecimals((cpu.usage / cpu.capacity) * 100);
  memory.percentage = roundDecimals((memory.usage / memory.capacity) * 100);

  return (
    <div
      className="cluster-overview__graphs-wrapper"
      style={spacing.sapUiSmallMargin}
    >
      <UI5Panel
        disableMargin
        title={t('cluster-overview.statistics.cpu-usage-m')}
      >
        <CircleProgress
          color="var(--sapIndicationColor_7)"
          value={roundDecimals(cpu.usage)}
          max={roundDecimals(cpu.capacity)}
          reversed={true}
          tooltip={{
            content: t('cluster-overview.tooltips.cpu-used', {
              percentage: `${cpu.percentage}%`,
            }),
            position: 'bottom',
          }}
        />
      </UI5Panel>
      <UI5Panel
        disableMargin
        title={t('cluster-overview.statistics.memory-usage-gib')}
      >
        <CircleProgress
          color="var(--sapIndicationColor_6)"
          value={roundDecimals(memory.usage)}
          max={roundDecimals(memory.capacity)}
          reversed={true}
          tooltip={{
            content: t('cluster-overview.tooltips.memory-used', {
              percentage: `${memory.percentage}%`,
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
