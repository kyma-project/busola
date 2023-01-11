import React from 'react';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';

export function HelmReleaseStatus({ status }) {
  const resolveType = status => {
    switch (status) {
      case 'deployed':
        return 'positive';
      case 'uninstalling':
        return 'critical';
      case 'failed':
        return 'negative';
      case 'unknown':
        return undefined;
      default:
        return 'informative';
    }
  };

  return (
    <StatusBadge resourceKind="helm-releases" type={resolveType(status)}>
      {status}
    </StatusBadge>
  );
}
