import React from 'react';
import { StatusBadge } from 'react-shared';

export function StatefulSetReplicas({ set }) {
  const current = set.status.currentReplicas || 0;
  const total = set.spec.replicas;
  const statusType = current === total ? 'success' : 'info';
  return (
    <StatusBadge
      type={statusType}
      noTooltip
    >{`${current} / ${total}`}</StatusBadge>
  );
}
