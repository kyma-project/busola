import React from 'react';

import { StatusBadge } from 'react-shared';

export function CertificateStatus({ status }) {
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
