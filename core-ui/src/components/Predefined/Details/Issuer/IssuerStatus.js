import React from 'react';

import { StatusBadge } from 'react-shared';

export function IssuerStatus({ status }) {
  if (!status) {
    return '-';
  }

  return (
    <StatusBadge
      autoResolveType
      additionalContent={status.message}
      noTooltip={status.state === 'Ready'}
    >
      {status.state}
    </StatusBadge>
  );
}
