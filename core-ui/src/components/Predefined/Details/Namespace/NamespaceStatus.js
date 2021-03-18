import React from 'react';
import { StatusBadge } from 'react-shared';

export function NamespaceStatus({ namespaceStatus }) {
  const badgeType = status => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Terminating':
        return 'info';
      default:
        return 'error';
    }
  };

  return (
    <StatusBadge type={badgeType(namespaceStatus.phase)}>
      {namespaceStatus.phase}
    </StatusBadge>
  );
}
