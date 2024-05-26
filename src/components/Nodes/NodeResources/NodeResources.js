import { useTranslation } from 'react-i18next';
import { UI5RadialChart } from 'shared/components/UI5RadialChart/UI5RadialChart';
import { Card, CardHeader } from '@ui5/webcomponents-react';
import { roundTwoDecimals } from 'shared/utils/helpers';
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
          color="var(--sapChart_OrderedColor_5)"
          value={cpu.usage}
          max={cpu.capacity}
          additionalInfo={`${roundTwoDecimals(cpu.usage)}m / ${roundTwoDecimals(
            cpu.capacity,
          )}m`}
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
          color="var(--sapChart_OrderedColor_6)"
          value={memory.usage}
          max={memory.capacity}
          additionalInfo={`${roundTwoDecimals(
            memory.usage,
          )}GiB / ${roundTwoDecimals(memory.capacity)}GiB`}
        />
      </Card>
    </>
  ) : (
    t('components.error-panel.error')
  );
}
