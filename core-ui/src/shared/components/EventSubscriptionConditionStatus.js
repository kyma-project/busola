import React from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from 'react-shared';

export const EventSubscriptionConditionStatus = ({ condition }) => {
  const { i18n } = useTranslation();
  const statusBadgeProperties =
    condition?.status === 'False'
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
      additionalContent={condition?.message}
      i18n={i18n}
    >
      {statusBadgeProperties.text}
    </StatusBadge>
  );
};
