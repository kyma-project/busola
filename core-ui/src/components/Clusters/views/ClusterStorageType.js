import React from 'react';
import { StatusBadge } from 'react-shared';

export function ClusterStorageType({ clusterConfig }) {
  console.log(clusterConfig);
  const storage = clusterConfig?.storage;

  const descriptions = {
    localStorage: {
      name: 'localStorage',
      tooltip: 'This data is persisted between browser reloads.',
    },
    sessionStorage: {
      name: 'sessionStorage',
      tooltip: 'This data is cleared when the page session ends.',
    },
    inMemory: {
      name: 'In memory',
      tooltip:
        'This data is cleared when the page is refreshed or navigated out of.',
    },
  };

  const description = descriptions[storage] || {
    name: 'unknown',
    description: 'Unknown storage type.',
  };

  return (
    <StatusBadge
      type={descriptions[storage] ? 'info' : 'warning'}
      tooltipContent={description.tooltip}
    >
      {description.name}
    </StatusBadge>
  );
}
