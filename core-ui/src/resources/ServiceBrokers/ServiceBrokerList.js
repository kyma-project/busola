import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { ExternalLink } from 'shared/components/Link/ExternalLink';

export function ServiceBrokerList(props) {
  const { t, i18n } = useTranslation();
  const customColumns = [
    {
      header: t('brokers.headers.url'),
      value: ({ spec }) => spec.url,
    },
    {
      header: t('common.headers.status'),
      value: ({ status }) => {
        const lastCondition = status.conditions[status.conditions.length - 1];

        let type = 'info';
        if (lastCondition.type === 'Ready') type = 'ready';
        if (lastCondition.reason.toUpperCase().includes('ERROR'))
          type = 'error';

        return (
          <StatusBadge
            autoResolveType
            additionalContent={lastCondition?.message}
            i18n={i18n}
          >
            {type || status.lastConditionState}
          </StatusBadge>
        );
      },
    },
  ];

  const description = (
    <Trans i18nKey="brokers.description">
      <ExternalLink
        className="fd-link"
        url="https://kyma-project-old.netlify.app/docs/components/service-catalog#overview-service-brokers"
      />
    </Trans>
  );

  return (
    <ResourcesList
      customColumns={customColumns}
      description={description}
      {...props}
    />
  );
}
export default ServiceBrokerList;
