import { spacing } from '@ui5/webcomponents-react-base';
import { useTranslation } from 'react-i18next';
import { CircleProgress } from 'shared/components/CircleProgress/CircleProgress';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';

export default function ClusterStats({ data }) {
  const { t } = useTranslation();

  let cpu = { usage: 0, capacity: 0 };
  let memory = { usage: 0, capacity: 0 };

  for (const node of data) {
    cpu.usage += node.metrics.cpu.usage;
    cpu.capacity += node.metrics.cpu.capacity;
    memory.usage += node.metrics.memory.usage;
    memory.capacity += node.metrics.memory.capacity;
  }

  return (
    <div
      className="cluster-overview__graphs-wrapper"
      style={spacing.sapUiSmallMargin}
    >
      <UI5Panel disableMargin title="CPU Usage">
        <CircleProgress
          color="var(--sapIndicationColor_7)"
          value={cpu.usage}
          max={cpu.capacity}
          title={t('machine-info.cpu-m')}
          reversed={true}
          tooltip={{
            content: `${t('machine-info.cpu-usage')} ${cpu.percentage}`,
            position: 'right',
          }}
        />
      </UI5Panel>
      <UI5Panel disableMargin title="Memory Usage">
        <CircleProgress
          color="var(--sapIndicationColor_6)"
          value={memory.usage}
          max={memory.capacity}
          title={t('machine-info.memory-gib')}
          reversed={true}
          tooltip={{
            content: `${t('machine-info.memory-usage')} ${memory.percentage}`,
            position: 'right',
          }}
        />
      </UI5Panel>
      <UI5Panel disableMargin title="Test"></UI5Panel>
    </div>
  );
}
