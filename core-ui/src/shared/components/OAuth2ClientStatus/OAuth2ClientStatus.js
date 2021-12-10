import React from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from 'react-shared';

export const OAuth2ClientStatus = ({ client }) => {
  const { t } = useTranslation();
  const error = client.status?.reconciliationError || {};
  const { code, description } = error;

  if (!code) {
    return (
      <StatusBadge
        type="success"
        tooltipContent={t('oauth2-clients.tooltips.ok')}
      >
        {t('common.buttons.ok')}
      </StatusBadge>
    );
  }

  return (
    <StatusBadge type="error" additionalContent={description}>
      {code}
    </StatusBadge>
  );
};
