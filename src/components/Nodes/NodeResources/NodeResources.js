import { useTranslation } from 'react-i18next';
import { UI5RadialChart } from 'shared/components/UI5RadialChart/UI5RadialChart';
import { Card, CardHeader } from '@ui5/webcomponents-react';
import './NodeResources.scss';

export function NodeResources({ metrics }) {
  const { t } = useTranslation();
  const { cpu, memory } = metrics || {};

  return cpu && memory ? (
    <>
      <Card
        className="radial-chart-card"
        header={
          <CardHeader titleText={t('cluster-overview.statistics.cpu-usage')} />
        }
      >
        <UI5RadialChart
          color="var(--sapChart_Bad)"
          value={cpu.usage}
          max={cpu.capacity}
          tooltip={{
            content: `${t('machine-info.cpu-m')} ${cpu.usage}/${cpu.capacity}`,
            position: 'bottom',
          }}
        />
      </Card>
      <Card
        className="radial-chart-card"
        header={
          <CardHeader
            titleText={t('cluster-overview.statistics.memory-usage')}
          />
        }
      >
        <UI5RadialChart
          color="var(--sapChart_Good)"
          value={memory.usage}
          max={memory.capacity}
          tooltip={{
            content: `${t('machine-info.memory-gib')} ${memory.usage}/${
              memory.capacity
            }`,
            position: 'bottom',
          }}
        />
      </Card>
    </>
  ) : (
    t('components.error-panel.error')
  );
}
