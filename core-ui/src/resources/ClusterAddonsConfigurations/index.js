import React from 'react';

export const resourceType = 'ClusterAddonsConfigurations';
export const namespaced = false;

export const List = React.lazy(() =>
  import('./ClusterAddonsConfigurationList'),
);
export const Details = React.lazy(() =>
  import('./ClusterAddonsConfigurationDetails'),
);
