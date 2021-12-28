import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, EMPTY_TEXT_PLACEHOLDER } from 'react-shared';
import { Trans } from 'react-i18next';
import { EventSubscriptionConditionStatus } from 'shared/components/EventSubscriptionConditionStatus';
import './EventSubscriptions.scss';

const EventTypes = ({ filters }) => {
  return (
    <div className="event-types-wrapper ">
      {filters.length > 0 ? (
        filters?.map(filter => (
          <span className="fd-token fd-token--read-only">
            <span className="fd-token__text fd-has-font-size-small">
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
    {
      header: 'Event types',
      value: ({ spec }) => <EventTypes filters={spec.filter.filters} />,
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
