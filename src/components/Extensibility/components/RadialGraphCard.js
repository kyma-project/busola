import { Card, CardHeader } from '@ui5/webcomponents-react';
import { UI5RadialChart } from 'shared/components/UI5RadialChart/UI5RadialChart';
import { roundTwoDecimals } from 'shared/utils/helpers';

export function RadialGraphCard({ structure }) {
  return (
    <div className="item-wrapper high">
      <Card
        className="radial-chart-card"
        header={<CardHeader titleText={structure?.name} />}
      >
        <UI5RadialChart
          colorNumber={structure?.color}
          value={roundTwoDecimals(structure?.value)}
          max={roundTwoDecimals(structure?.max)}
          additionalInfo={structure?.additionalInfo}
        />
      </Card>
    </div>
  );
}
