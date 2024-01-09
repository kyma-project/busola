import { useTranslation } from 'react-i18next';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { UI5RadialChart } from 'shared/components/UI5RadialChart/UI5RadialChart';
import './NodeResources.scss';

export function NodeResources({ metrics, headerContent }) {
  const { t } = useTranslation();
  const { cpu, memory } = metrics || {};

  return (
    <UI5Panel disableMargin title={headerContent} className="node-resources">
      {cpu && memory ? (
        <div className="nodes-workloads__body">
          <UI5RadialChart
            color="var(--sapIndicationColor_7)"
            value={cpu.usage}
            max={cpu.capacity}
            title={t('machine-info.cpu-usage')}
            tooltip={{
              content: `${t('machine-info.cpu-m')} ${cpu.usage}/${
                cpu.capacity
              }`,
              position: 'bottom',
            }}
          />
          <UI5RadialChart
            color="var(--sapIndicationColor_6)"
            value={memory.usage}
            max={memory.capacity}
            title={t('machine-info.memory-usage')}
            tooltip={{
              content: `${t('machine-info.memory-gib')} ${memory.usage}/${
                memory.capacity
              }`,
              position: 'bottom',
            }}
          />
        </div>
      ) : (
        t('components.error-panel.error')
      )}
    </UI5Panel>
  );
}
