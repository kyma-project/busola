import React from 'react';
import { useTranslation } from 'react-i18next';
import { TooltipBadge } from 'react-shared';

export function RunningPodsStatus({ running, expected }) {
  const { t } = useTranslation();

  const statusType = running === expected ? 'positive' : 'negative';

  return (
    <TooltipBadge
      type={statusType}
      tooltipContent={t('common.tooltips.running-pods', { running, expected })}
    >{`${running} / ${expected}`}</TooltipBadge>
  );
}
