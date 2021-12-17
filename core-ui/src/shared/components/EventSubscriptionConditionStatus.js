import React from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from 'react-shared';

export const EventSubscriptionConditionStatus = ({ status }) => {
  const { i18n } = useTranslation();

  const lastCondition = status.conditions[status.conditions.length - 1];
  const statusBadgeProperties =
    lastCondition.status === 'False'
      ? {
          type: 'error',
          text: 'Error',
        }
      : {
          type: 'success',
          text: 'Ready',
        };

  return (
    <StatusBadge
      type={statusBadgeProperties.type}
      additionalContent={lastCondition?.message}
      i18n={i18n}
    >
      {statusBadgeProperties.text}
    </StatusBadge>
  );
};
