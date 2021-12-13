import React from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from 'react-shared';

export function RunningPodsStatus({ running, expected }) {
  const { t } = useTranslation();

  const statusType = running === expected ? 'success' : 'error';

  return (
    <StatusBadge
      type={statusType}
      tooltipContent={t('common.tooltips.running-pods', { running, expected })}
    >{`${running} / ${expected}`}</StatusBadge>
  );
}
