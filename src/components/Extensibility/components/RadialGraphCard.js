import { Card, CardHeader } from '@ui5/webcomponents-react';
import { UI5RadialChart } from 'shared/components/UI5RadialChart/UI5RadialChart';
import { roundTwoDecimals } from 'shared/utils/helpers';

export function RadialGraphCard({ structure }) {
  return (
    <Card
      className="radial-chart-card"
      header={<CardHeader titleText={structure?.name} />}
    >
      <UI5RadialChart
        color="var(--sapChart_OrderedColor_5)"
        value={roundTwoDecimals(structure?.value)}
        max={roundTwoDecimals(structure?.max)}
        additionalInfo={structure?.additionalInfo}
      />
    </Card>
  );
}
