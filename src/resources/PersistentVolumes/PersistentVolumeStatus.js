import React from 'react';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';

export function PersistentVolumeStatus({ status }) {
  const badgeType = status => {
    switch (status) {
      case 'Bound':
      case 'Available':
        return 'success';
      case 'Released':
      case 'Pending':
        return 'info';
      default:
        return 'error';
    }
  };

  return (
    <StatusBadge
      resourceKind="pv"
      type={badgeType(status?.phase)}
      additionalContent={status?.message}
    >
      {status?.phase}
    </StatusBadge>
  );
}
