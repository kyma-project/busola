import React from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';

export const OAuth2ClientStatus = ({ client }) => {
  const { t } = useTranslation();
  const error = client.status?.reconciliationError || {};
  const { code, description } = error;

  if (!code) {
    return (
      <StatusBadge
        type="success"
        additionalContent={t('oauth2-clients.tooltips.ok')}
      >
        OK
      </StatusBadge>
    );
  }

  return (
    <StatusBadge type="error" additionalContent={description}>
      {code}
    </StatusBadge>
  );
};
