import { Card, CardHeader } from '@ui5/webcomponents-react';
import { spacing } from '@ui5/webcomponents-react-base';
import { useUrl } from 'hooks/useUrl';
import { useTranslation } from 'react-i18next';
import { DynamicPageComponent } from '../DynamicPageComponent/DynamicPageComponent';
import { Link } from '../Link/Link';

import './CountingCard.scss';

type CountingCardProps = {
  value: number;
  extraInfo: any;
  title: string;
  subTitle: string;
  resourceUrl: string;
};

export const CountingCard = ({
  value,
  extraInfo,
  title,
  subTitle,
  resourceUrl,
}: CountingCardProps) => {
  const { t } = useTranslation();
  const { namespaceUrl } = useUrl();

  return (
    <Card
      className="counting-card"
      style={{ maxWidth: extraInfo ? '325px' : '175px' }}
      header={<CardHeader titleText={title} subtitleText={subTitle} />}
    >
      <div
        style={{
          ...spacing.sapUiSmallMarginBeginEnd,
          ...spacing.sapUiSmallMarginBottom,
        }}
      >
        <div
          className="counting-card__content"
          style={{
            ...spacing.sapUiSmallMarginBottom,
            marginTop: !subTitle ? '17.5px' : '0px',
          }}
        >
          <p className="counting-card__value">{value}</p>
          {extraInfo && (
            <div className="counting-card__extra-content">
              {extraInfo.map((info: any) => (
                <DynamicPageComponent.Column
                  title={info.title}
                  columnSpan={null}
                  image={null}
                >
                  {info.value}
                </DynamicPageComponent.Column>
              ))}
            </div>
          )}
        </div>
        {resourceUrl && (
          <Link
            design="Default"
            url={namespaceUrl(resourceUrl, {
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
