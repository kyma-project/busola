import { Card, CardHeader } from '@ui5/webcomponents-react';
import { spacing } from '@ui5/webcomponents-react-base';
import './CountingCard.scss';

type CountingCardProps = {
  value: number;
  title: string;
};

export const CountingCard = ({ value, title }: CountingCardProps) => {
  return (
    <Card className="counting-card" header={<CardHeader titleText={title} />}>
      <div style={spacing.sapUiSmallMargin}>
        <p className="counting-card__value">{value ?? ' '}</p>
      </div>
    </Card>
  );
};
