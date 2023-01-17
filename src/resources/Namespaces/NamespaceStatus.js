import React from 'react';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';

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
    <StatusBadge
      resourceKind="namespaces"
      type={badgeType(namespaceStatus.phase)}
    >
      {namespaceStatus.phase}
    </StatusBadge>
  );
}
