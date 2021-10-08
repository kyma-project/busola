import React from 'react';
import { StatusBadge } from 'react-shared';
import { useTranslation } from 'react-i18next';

export const ServiceAccountTokenStatus = ({ token }) => {
  const { t } = useTranslation();

  const accountTokenValues = token
    ? {
        type: 'warning',
        tooltipContent: 'inform',
        status: 'enabled',
      }
    : {
        type: 'info',
        tooltipContent: '',
        status: 'disabled',
      };

  return (
    <StatusBadge
      type={accountTokenValues.type}
      tooltipContent={accountTokenValues.tooltipContent}
    >
      {accountTokenValues.status}
    </StatusBadge>
  );
};
