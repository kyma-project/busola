import React from 'react';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';

export function ClusterStorageType({ clusterConfig }) {
  const storage = clusterConfig?.storage;
  const knownStorage = ['localStorage', 'sessionStorage', 'inMemory'];

  return (
    <StatusBadge
      resourceKind="clusters"
      type={knownStorage.includes(storage) ? 'info' : 'warning'}
    >
      {storage || 'unknown'}
    </StatusBadge>
  );
}
