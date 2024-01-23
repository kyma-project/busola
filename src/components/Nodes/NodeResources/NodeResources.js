import { useTranslation } from 'react-i18next';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { UI5RadialChart } from 'shared/components/UI5RadialChart/UI5RadialChart';
import './NodeResources.scss';
import { Card, CardHeader, Title } from '@ui5/webcomponents-react';
import { spacing } from '@ui5/webcomponents-react-base';

export function NodeResources({ metrics, headerContent }) {
  const { t } = useTranslation();
  const { cpu, memory } = metrics || {};

  return (
    <>
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
                color="var(--sapIndicationColor_7)"
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
                color="var(--sapIndicationColor_6)"
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
    </>
  );
}
