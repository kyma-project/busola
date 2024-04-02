import {
  AnalyticalCardHeader,
  Card,
  NumericSideIndicator,
} from '@ui5/webcomponents-react';
import { spacing } from '@ui5/webcomponents-react-base';
import { useUrl } from 'hooks/useUrl';
import { useTranslation } from 'react-i18next';
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
      header={
        <AnalyticalCardHeader
          titleText={title}
          subtitleText={subTitle}
          value={value.toString()}
          style={{ paddingBottom: '0px' }}
        >
          {extraInfo?.map((info: any) => (
            <NumericSideIndicator
              number={info?.value}
              titleText={info?.title}
            />
          ))}
        </AnalyticalCardHeader>
      }
    >
      <div
        style={{
          ...spacing.sapUiSmallMarginBeginEnd,
          ...spacing.sapUiSmallMarginBottom,
        }}
      >
        {resourceUrl && (
          <Link
            design="Default"
            url={namespaceUrl(resourceUrl, {
              namespace: '-all-',
            })}
            className="counting-card__link"
          >
            {t('common.buttons.learn-more')}
          </Link>
        )}
      </div>
    </Card>
  );
};
