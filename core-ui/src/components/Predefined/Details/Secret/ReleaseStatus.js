import React from 'react';
import { StatusBadge } from 'react-shared';

export function ReleaseStatus({ release }) {
  const status = release.info.status;

  const type = status === 'deployed' ? 'success' : 'info';

  return (
    <StatusBadge type={type} noTooltip>
      {status}
    </StatusBadge>
  );
}
