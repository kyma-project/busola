import React from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from 'react-shared';

export function ClusterStorageType({ clusterConfig }) {
  const { t, i18n } = useTranslation();

  const storage = clusterConfig?.storage;

  const descriptions = {
    localStorage: {
      name: t('clusters.storage.labels.localStorage'),
      tooltip: t('clusters.storage.descriptions.localStorage'),
    },
    sessionStorage: {
      name: t('clusters.storage.labels.sessionStorage'),
      tooltip: t('clusters.storage.descriptions.sessionStorage'),
    },
    inMemory: {
      name: t('clusters.storage.labels.inMemory'),
      tooltip: t('clusters.storage.descriptions.inMemory'),
    },
  };

  const description = descriptions[storage] || {
    name: t('clusters.storage.labels.unknown'),
    tooltip: t('clusters.storage.descriptions.unknown'),
  };

  return (
    <StatusBadge
      i18n={i18n}
      resourceKind={'node'}
      type={descriptions[storage] ? 'info' : 'warning'}
      tooltipContent={description.tooltip}
    >
      {description.name}
    </StatusBadge>
  );
}
