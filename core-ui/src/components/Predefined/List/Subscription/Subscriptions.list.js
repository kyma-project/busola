import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Link, EMPTY_TEXT_PLACEHOLDER, ResourcesList } from 'react-shared';
import { SubscriptionConditionStatus } from 'shared/components/SubscriptionConditionStatus';
import { SubscriptionsCreate } from '../../Create/Subscriptions/Subscriptions.create';
import './Subscriptions.scss';

const EventTypes = ({ filters }) => {
  return (
    <div className="event-types-wrapper ">
      {filters.length > 0 ? (
        filters?.map(filter => (
          <span
            className="fd-token fd-token--read-only"
            key={filter.eventType.value}
          >
            <span
              className="fd-token__text fd-has-font-size-small"
              key={filter.eventType.value}
            >
              {filter.eventType.value}
            </span>
          </span>
        ))
      ) : (
        <span>{EMPTY_TEXT_PLACEHOLDER}</span>
      )}
    </div>
  );
};

const SubscriptionsList = props => {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('common.headers.status'),
      value: ({ status }) => {
        const lastCondition =
          status?.conditions?.[status.conditions.length - 1] || 'unknown';

        return <SubscriptionConditionStatus condition={lastCondition} />;
      },
    },
    {
      header: 'Event types',
      value: ({ spec }) => <EventTypes filters={spec.filter.filters} />,
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
      resourceName={t('subscriptions.title')}
      customColumns={customColumns}
      description={description}
      createResourceForm={SubscriptionsCreate}
      {...props}
    />
  );
};

export default SubscriptionsList;
