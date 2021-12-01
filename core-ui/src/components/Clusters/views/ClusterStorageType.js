import React from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from 'react-shared';

export function ClusterStorageType({ clusterConfig }) {
  const { i18n } = useTranslation();

  const storage = clusterConfig?.storage;
  const knownStorage = ['localStorage', 'sessionStorage', 'inMemory'];

  return (
    <StatusBadge
      i18n={i18n}
      resourceKind={'clusters'}
      type={knownStorage.includes(storage) ? 'info' : 'warning'}
    >
      {storage || 'unknown'}
    </StatusBadge>
  );
}
