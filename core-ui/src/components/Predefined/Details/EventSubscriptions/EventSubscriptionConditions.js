import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  EMPTY_TEXT_PLACEHOLDER,
  ReadableCreationTimestamp,
  GenericList,
} from 'react-shared';
import { EventSubscriptionConditionStatus } from 'shared/components/EventSubscriptionConditionStatus';
export function EventSubscriptionConditions(eventSubscription) {
  const { t, i18n } = useTranslation();

  const conditions = eventSubscription?.status?.conditions;
  const headerRenderer = _ => [
    t('event-subscription.headers.conditions.type'),
    t('event-subscription.headers.conditions.status'),
    t('event-subscription.headers.conditions.reason'),
    t('event-subscription.headers.conditions.last-transition'),
  ];

  const rowRenderer = condition => [
    <EventSubscriptionConditionStatus condition={condition} />,
    condition?.status || EMPTY_TEXT_PLACEHOLDER,
    condition?.reason || EMPTY_TEXT_PLACEHOLDER,
    <ReadableCreationTimestamp timestamp={condition?.lastTransitionTime} />,
  ];

  return (
    <GenericList
      key="event-subscription-conditions"
      title={t('event-subscription.headers.conditions.title')}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      entries={conditions || []}
      i18n={i18n}
    />
  );
}
