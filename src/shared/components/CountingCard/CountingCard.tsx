import { Card, CardHeader } from '@ui5/webcomponents-react';
import { spacing } from '@ui5/webcomponents-react-base';
import { Link } from 'react-router-dom';
import { useUrl } from 'hooks/useUrl';
import { useTranslation } from 'react-i18next';
import './CountingCard.scss';

type CountingCardProps = {
  value: number;
  title: string;
  resourceUrl: string;
};

export const CountingCard = ({
  value,
  title,
  resourceUrl,
}: CountingCardProps) => {
  const { t } = useTranslation();
  const { namespaceUrl } = useUrl();

  return (
    <Card className="counting-card" header={<CardHeader titleText={title} />}>
      <div
        style={{
          ...spacing.sapUiSmallMarginBeginEnd,
          ...spacing.sapUiSmallMarginBottom,
        }}
      >
        <p
          className="counting-card__value learn-more-link"
          style={spacing.sapUiSmallMarginBottom}
        >
          {value ?? ' '}
        </p>
        {resourceUrl && (
          <Link
            className="bsl-link learn-more-link"
            to={namespaceUrl(resourceUrl, {
              namespace: '-all-',
            })}
          >
            {t('common.buttons.learn-more')}
          </Link>
        )}
      </div>
    </Card>
  );
};
