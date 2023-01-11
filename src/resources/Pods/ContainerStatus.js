import React from 'react';

import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';

export function ContainerStatus({ status }) {
  const state =
    status?.state?.running ||
    status?.state?.waiting ||
    status?.state?.terminated;

  const containerStatus =
    state?.reason || Object.keys(status?.state || {})?.[0] || 'Unknown';
  const message = state?.message || null;

  const badgeType = status => {
    switch (status?.toLowerCase()) {
      case 'running':
      case 'completed':
      case 'succeeded':
        return 'success';
      case 'containercreating':
      case 'initing':
      case 'pending':
      case 'podinitializing':
      case 'terminating':
        return 'info';
      case 'unknown':
        return undefined;
      default:
        return 'error';
    }
  };

  return (
    <div>
      <StatusBadge
        resourceKind="containers"
        additionalContent={message}
        type={badgeType(containerStatus)}
      >
        {containerStatus}
      </StatusBadge>
    </div>
  );
}
