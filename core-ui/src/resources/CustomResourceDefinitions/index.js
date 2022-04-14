import React from 'react';

export const resourceType = 'CustomResourceDefinitions';
export const namespaced = false;

export const List = React.lazy(() => import('./CustomResourceDefinitionList'));
export const Details = React.lazy(() =>
  import('./CustomResourceDefinitionDetails'),
);
