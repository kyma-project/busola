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
    t('event-subscription.conditions.type'),
    t('event-subscription.conditions.status'),
    t('event-subscription.conditions.reason'),
    t('event-subscription.conditions.last-transition-time'),
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
      title={t('event-subscription.conditions.title')}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      entries={conditions || []}
      i18n={i18n}
    />
  );
}
