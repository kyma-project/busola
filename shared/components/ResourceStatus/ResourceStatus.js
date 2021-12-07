import React from 'react';

import { StatusBadge } from '../StatusBadge/StatusBadge';

export function ResourceStatus({
  status,
  resourceKind,
  readyStatus = 'Ready',
}) {
  if (!status) {
    return '-';
  }

  return (
    <StatusBadge
      autoResolveType
      resourceKind={resourceKind}
      additionalContent={status.message}
      noTooltip={status.state === readyStatus}
    >
      {status.state}
    </StatusBadge>
  );
}
