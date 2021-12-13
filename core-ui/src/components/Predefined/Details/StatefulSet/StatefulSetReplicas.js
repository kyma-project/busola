import React from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from 'react-shared';

export function StatefulSetReplicas({ set }) {
  const { t } = useTranslation();

  const current = set.status.currentReplicas || 0;
  const total = set.spec.replicas || 0;
  const statusType = current === total ? 'success' : 'error';

  return (
    <StatusBadge
      type={statusType}
      tooltipContent={
        current === total
          ? t('stateful-sets.tooltips.pods-running')
          : t('stateful-sets.tooltips.pods-error')
      }
    >{`${current} / ${total}`}</StatusBadge>
  );
}
