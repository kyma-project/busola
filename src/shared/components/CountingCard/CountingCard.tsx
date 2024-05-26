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
  isClusterResource: boolean;
};

export const CountingCard = ({
  value,
  extraInfo,
  title,
  subTitle = ' ',
  resourceUrl,
  isClusterResource = false,
}: CountingCardProps) => {
  const { t } = useTranslation();
  const { namespaceUrl, clusterUrl } = useUrl();

  return (
    <Card
      className="counting-card"
      style={{
        width: extraInfo ? '325px' : '154.5px',
        maxWidth: extraInfo ? '325px' : '154.5px',
        maxHeight: resourceUrl ? '145px' : '120px',
      }}
      header={
        <AnalyticalCardHeader
          titleText={title}
          subtitleText={subTitle}
          value={value.toString()}
          style={{ paddingBottom: '0px' }}
          aria-level={6}
        >
          {extraInfo?.map((info: any, index: number) => (
            <NumericSideIndicator
              number={info?.value}
              titleText={info?.title}
              key={index}
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
            url={
              isClusterResource
                ? clusterUrl(resourceUrl)
                : namespaceUrl(resourceUrl, {
                    namespace: '-all-',
                  })
            }
            className="counting-card__link"
          >
            {t('common.buttons.learn-more')}
          </Link>
        )}
      </div>
    </Card>
  );
};
