import React from 'react';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';

export function HelmReleaseStatus({ status }) {
  const resolveType = status => {
    switch (status) {
      case 'deployed':
        return 'Success';
      case 'uninstalling':
      case 'failed':
        return 'Error';
      case 'unknown':
        return 'None';
      default:
        return 'Information';
    }
  };

  return (
    <StatusBadge resourceKind="helm-releases" type={resolveType(status)}>
      {status}
    </StatusBadge>
  );
}
