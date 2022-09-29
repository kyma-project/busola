import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { Link } from 'shared/components/Link/Link';
import { SubscriptionConditionStatus } from 'shared/components/SubscriptionConditionStatus';
import { Tokens } from 'shared/components/Tokens';
import { SubscriptionCreate } from './SubscriptionCreate';

export function SubscriptionList(props) {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('common.headers.status'),
      value: ({ status }) => {
        const lastCondition =
          status?.conditions?.[status?.conditions?.length - 1] || 'unknown';

        return <SubscriptionConditionStatus condition={lastCondition} />;
      },
    },
    {
      header: t('subscriptions.create.labels.event-type-plural'),
      value: ({ spec }) => (
        <Tokens
          tokens={(spec.filter.filters || []).map(f => f.eventType.value)}
        />
      ),
    },
  ];

  const description = (
    <Trans i18nKey="subscriptions.description">
      <Link
        className="fd-link"
        url="https://kyma-project.io/docs/kyma/latest/05-technical-reference/00-custom-resources/evnt-01-subscription/#documentation-content"
      />
    </Trans>
  );

  return (
    <ResourcesList
      resourceTitle={t('subscriptions.title')}
      customColumns={customColumns}
      description={description}
      {...props}
      createResourceForm={SubscriptionCreate}
    />
  );
}

export default SubscriptionList;
