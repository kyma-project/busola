import React from 'react';
import { useTranslation } from 'react-i18next';

import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';

export function ResourceStatus({
  status,
  readyStatus = 'Ready',
  i18n,
  ...props
}) {
  const { t } = useTranslation(null, { i18n });

  const state = status?.state || status?.status || status?.phase;

  if (!state) {
    return (
      <StatusBadge noTooltip {...props}>
        {t('common.statuses.unknown')}
      </StatusBadge>
    );
  }

  return (
    <StatusBadge
      autoResolveType
      additionalContent={state === readyStatus ? null : status.message}
      i18n={i18n}
      {...props}
    >
      {state}
    </StatusBadge>
  );
}
