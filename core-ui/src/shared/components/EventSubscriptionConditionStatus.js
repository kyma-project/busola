import React from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from 'react-shared';

export const EventSubscriptionConditionStatus = ({ condition }) => {
  const { t, i18n } = useTranslation();
  const statusBadgeProperties =
    condition?.status === 'True'
      ? {
          type: 'success',
          text: t('common.statuses.ready'),
        }
      : {
          type: 'error',
          text: t('common.statuses.error'),
        };
  return (
    <StatusBadge
      additionalContent={condition?.message}
      resourceKind="subscription"
      type={statusBadgeProperties.type}
      i18n={i18n}
    >
      {statusBadgeProperties.text}
    </StatusBadge>
  );
};
