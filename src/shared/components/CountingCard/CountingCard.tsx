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
  extraInfo: [ExtraInfo];
  title: string;
  subTitle: string;
  resourceUrl?: string;
  isClusterResource?: boolean;
  allNamespaceURL?: boolean;
  className?: string;
};

type ExtraInfo = {
  value: string;
  title: string;
};

export const CountingCard = ({
  value,
  extraInfo,
  title,
  subTitle = '',
  resourceUrl,
  isClusterResource = false,
  allNamespaceURL = true,
  className = ''
}: CountingCardProps) => {
  const { t } = useTranslation();
  const { namespaceUrl, clusterUrl } = useUrl();

  return (
    <Card
      className={`counting-card ${className}`}
      style={{
        width: extraInfo ? '325px' : '175px',
        maxWidth: extraInfo ? '325px' : '175px',
        height: '145px',
        maxHeight: '145px',
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
                : namespaceUrl(
                    resourceUrl,
                    allNamespaceURL ? { namespace: '-all-' } : {},
                  )
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
