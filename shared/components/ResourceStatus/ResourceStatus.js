import React from 'react';
import { useTranslation } from 'react-i18next';

import { StatusBadge } from '../StatusBadge/StatusBadge';

export function ResourceStatus({
  status,
  readyStatus = 'Ready',
  i18n,
  ...props
}) {
  const { t } = useTranslation(null, { i18n });

  if (!status) {
    return (
      <StatusBadge noTooltip {...props}>
        {t('common.statuses.unknown')}
      </StatusBadge>
    );
  }

  return (
    <StatusBadge
      autoResolveType
      additionalContent={status.message}
      noTooltip={status.state === readyStatus}
      i18n={i18n}
      {...props}
    >
      {status.state}
    </StatusBadge>
  );
}
