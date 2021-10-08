import React from 'react';
import { StatusBadge } from 'react-shared';
import { useTranslation } from 'react-i18next';

export const ServiceAccountTokenStatus = ({ automount }) => {
  const { t } = useTranslation();

  const accountTokenValues = automount
    ? {
        type: 'warning',
        tooltipContent: t('service-accounts.auto-mount-token.description'),
        status: t('service-accounts.auto-mount-token.enabled'),
      }
    : {
        type: 'info',
        tooltipContent: '',
        status: t('service-accounts.auto-mount-token.disabled'),
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
