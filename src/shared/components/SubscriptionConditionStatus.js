import React from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';

export const SubscriptionConditionStatus = ({ condition }) => {
  const { t } = useTranslation();
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
    >
      {statusBadgeProperties.text}
    </StatusBadge>
  );
};
