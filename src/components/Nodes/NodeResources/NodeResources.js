import { useTranslation } from 'react-i18next';
import { UI5RadialChart } from 'shared/components/UI5RadialChart/UI5RadialChart';
import './NodeResources.scss';
import { Card, CardHeader } from '@ui5/webcomponents-react';

export function NodeResources({ metrics }) {
  const { t } = useTranslation();
  const { cpu, memory } = metrics || {};

  return (
    <div className="cluster-overview__graphs-wrapper">
      {cpu && memory ? (
        <>
          <Card
            header={
              <CardHeader
                titleText={t('cluster-overview.statistics.cpu-usage')}
              />
            }
          >
            <UI5RadialChart
              color="var(--sapChart_Bad)"
              value={cpu.usage}
              max={cpu.capacity}
              tooltip={{
                content: `${t('machine-info.cpu-m')} ${cpu.usage}/${
                  cpu.capacity
                }`,
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
      )}
    </div>
  );
}
