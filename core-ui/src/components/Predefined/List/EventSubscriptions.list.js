import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-shared';
import { Trans } from 'react-i18next';
import { EventSubscriptionConditionStatus } from 'shared/components/EventSubscriptionConditionStatus';

//the name of the function cannot have 'Event' prefix, becuase it breaks list's and button's titles
export const SubscriptionsList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('common.headers.status'),
      value: ({ status }) => {
        const lastCondition = status.conditions[status.conditions.length - 1];

        return <EventSubscriptionConditionStatus condition={lastCondition} />;
      },
    },
  ];

  const description = (
    <Trans i18nKey="event-subscription.description">
      <Link
        className="fd-link"
        url="https://kyma-project.io/docs/kyma/latest/05-technical-reference/00-custom-resources/evnt-01-subscription/#documentation-content"
      />
    </Trans>
  );

  return (
    <DefaultRenderer
      resourceName={t('event-subscription.title')}
      customColumns={customColumns}
      description={description}
      {...otherParams}
    />
  );
};
