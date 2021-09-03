import React from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from 'react-shared';

export const OAuth2ClientStatus = ({ client }) => {
  const { t } = useTranslation();
  const error = client.status?.reconciliationError || {};
  const { code, description } = error;

  if (!code) {
    return <StatusBadge type="success">{t('common.buttons.ok')}</StatusBadge>;
  }

  return (
    <StatusBadge type="error" tooltipContent={description}>
      {code}
    </StatusBadge>
  );
};
