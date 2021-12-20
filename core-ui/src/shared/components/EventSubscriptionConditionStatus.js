import React from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from 'react-shared';

export const EventSubscriptionConditionStatus = ({ condition, isListView }) => {
  const { t, i18n } = useTranslation();
  const statusBadgeProperties =
    condition?.status === 'True'
      ? {
          type: 'success',
          text: t('common.statuses.ready'),
          tooltipMessage: condition?.type,
        }
      : {
          type: 'error',
          text: t('common.statuses.error'),
          tooltipMessage: condition?.message,
        };
  return (
    <StatusBadge
      type={statusBadgeProperties.type}
      additionalContent={statusBadgeProperties.tooltipMessage}
      i18n={i18n}
      noTooltip={condition?.status !== 'False' && !isListView}
    >
      {statusBadgeProperties.text}
    </StatusBadge>
  );
};
