import React from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from 'react-shared';

export function DaemonSetStatus({ daemonSet }) {
  const { t } = useTranslation();

  const current = daemonSet.status.numberReady || 0;
  const total =
    daemonSet.status.numberReady + (daemonSet.status.numberUnavailable || 0);
  const statusType = current === total ? 'success' : 'error';

  return (
    <StatusBadge
      type={statusType}
      tooltipContent={
        current === total
          ? t('daemon-sets.tooltips.pods-running')
          : t('daemon-sets.tooltips.pods-error')
      }
    >{`${current} / ${total}`}</StatusBadge>
  );
}
