import React from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from 'react-shared';

export const EventSubscriptionConditionStatus = ({ condition, isListView }) => {
  const { i18n } = useTranslation();
  const statusBadgeProperties =
    condition?.status === 'False'
      ? {
          type: 'error',
          text: 'Error',
          tooltipMessage: condition?.message,
        }
      : {
          type: 'success',
          text: 'Ready',
          tooltipMessage: condition?.type,
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
