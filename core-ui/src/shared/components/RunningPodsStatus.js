import React from 'react';
import { useTranslation } from 'react-i18next';
import { TooltipBadge } from 'shared/components/TooltipBadge/TooltipBadge';

export function RunningPodsStatus({ running, expected }) {
  const { t } = useTranslation();
  const tooltip =
    running === 1
      ? t('common.tooltips.running-pods-singular')
      : t('common.tooltips.running-pods-plural', { running });
  const statusType = running === expected ? 'positive' : 'negative';

  return (
    <TooltipBadge
      type={statusType}
      tooltipContent={tooltip}
    >{`${running} / ${expected}`}</TooltipBadge>
  );
}
