import { ReactNode } from 'react';
import {
  AnalyticalCardHeader,
  Card,
  NumericSideIndicator,
} from '@ui5/webcomponents-react';
import { useUrl } from 'hooks/useUrl';
import { useNavigate } from 'react-router';

import './CountingCard.scss';

type CountingCardProps = {
  value: number | string;
  extraInfo: ExtraInfo[];
  title: string;
  subTitle?: string;
  resourceUrl?: string;
  isClusterResource?: boolean;
  allNamespaceURL?: boolean;
  className?: string;
  additionalContent?: ReactNode;
};

type ExtraInfo = {
  value: number | string;
  title: string;
} | null;

export const CountingCard = ({
  value,
  extraInfo,
  title,
  subTitle = '',
  resourceUrl,
  isClusterResource = false,
  allNamespaceURL = true,
  className = '',
  additionalContent,
}: CountingCardProps) => {
  const { namespaceUrl, clusterUrl } = useUrl();
  const navigate = useNavigate();

  const targetUrl = resourceUrl
    ? isClusterResource
      ? clusterUrl(resourceUrl)
      : namespaceUrl(resourceUrl, allNamespaceURL ? { namespace: '-all-' } : {})
    : undefined;

  return (
    <Card
      className={`counting-card ${className}`}
      style={{
        width: extraInfo ? '325px' : '175px',
        maxWidth: extraInfo ? '325px' : '175px',
        height: '100%',
        minHeight: '145px',
        cursor: targetUrl ? 'pointer' : 'auto',
      }}
      onClick={targetUrl ? () => navigate(targetUrl) : undefined}
      onKeyDown={
        targetUrl
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate(targetUrl);
              }
            }
          : undefined
      }
      tabIndex={targetUrl ? 0 : undefined}
      role={targetUrl ? 'button' : undefined}
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
      {additionalContent ? (
        <div className="sap-margin-x-small sap-margin-bottom-small">
          {additionalContent}
        </div>
      ) : (
        <div />
      )}
    </Card>
  );
};
