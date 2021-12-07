import React from 'react';
import { StatusBadge } from 'react-shared';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-shared';
import { Trans } from 'react-i18next';

export const ServiceBrokersList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('brokers.headers.url'),
      value: ({ spec }) => spec.url,
    },
    {
      header: t('common.headers.status'),
      value: ({ status }) => {
        const lastCondition = status.conditions[status.conditions.length - 1];
        return (
          <StatusBadge
            autoResolveType
            additionalContent={lastCondition?.message}
          >
            {lastCondition?.type || status.lastConditionState}
          </StatusBadge>
        );
      },
    },
  ];

  const description = (
    <Trans i18nKey="brokers.description">
      <Link
        className="fd-link"
        url="https://kyma-project-old.netlify.app/docs/components/service-catalog#overview-service-brokers"
      />
    </Trans>
  );

  return (
    <DefaultRenderer
      customColumns={customColumns}
      description={description}
      {...otherParams}
    />
  );
};
