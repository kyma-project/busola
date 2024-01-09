import { Card } from '@ui5/webcomponents-react';
import { spacing } from '@ui5/webcomponents-react-base';
import './CountingCard.scss';

type CountingCardProps = {
  value: number;
  title: string;
};

export const CountingCard = ({ value, title }: CountingCardProps) => {
  return (
    <Card className="counting-card">
      <div
        className="counting-card__container"
        style={{ ...spacing.sapUiSmallMargin }}
      >
        <p className="counting-card__value">{value}</p>
        <p
          className="counting-card__title"
          style={{ ...spacing.sapUiTinyMarginTopBottom }}
        >
          {title}
        </p>
      </div>
    </Card>
  );
};
