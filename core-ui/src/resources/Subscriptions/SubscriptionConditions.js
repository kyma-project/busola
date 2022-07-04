import React from 'react';
import { useTranslation } from 'react-i18next';

import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { GenericList } from 'shared/components/GenericList/GenericList';

import { SubscriptionConditionStatus } from 'shared/components/SubscriptionConditionStatus';

export function SubscriptionConditions(subscription) {
  const { t, i18n } = useTranslation();

  const conditions = subscription?.status?.conditions;
  const headerRenderer = _ => [
    t('subscriptions.headers.conditions.type'),
    t('subscriptions.headers.conditions.status'),
    t('subscriptions.headers.conditions.reason'),
    t('subscriptions.headers.conditions.last-transition'),
  ];

  const rowRenderer = condition => [
    <SubscriptionConditionStatus condition={condition} />,
    condition?.status || EMPTY_TEXT_PLACEHOLDER,
    condition?.reason || EMPTY_TEXT_PLACEHOLDER,
    <ReadableCreationTimestamp timestamp={condition?.lastTransitionTime} />,
  ];

  return (
    <GenericList
      key="subscription-conditions"
      title={t('subscriptions.headers.conditions.title')}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      entries={conditions || []}
      i18n={i18n}
    />
  );
}
