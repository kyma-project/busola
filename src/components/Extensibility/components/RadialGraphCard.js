import { Card, CardHeader } from '@ui5/webcomponents-react';
import { UI5RadialChart } from 'shared/components/UI5RadialChart/UI5RadialChart';
import { roundTwoDecimals } from 'shared/utils/helpers';

export function RadialGraphCard({ structure }) {
  let color;
  if (structure?.color > 0 && structure?.color < 12) {
    color = `var(--sapChart_OrderedColor_${structure?.color})`;
  }

  return (
    <div className="item-wrapper tall">
      <Card
        className="radial-chart-card"
        header={<CardHeader titleText={structure?.name} />}
      >
        <UI5RadialChart
          color={color}
          value={roundTwoDecimals(structure?.value)}
          max={roundTwoDecimals(structure?.max)}
          additionalInfo={structure?.additionalInfo}
        />
      </Card>
    </div>
  );
}
