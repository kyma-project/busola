import React from 'react';

export const resourceType = 'ServiceInstances';
export const namespaced = true;

export const List = React.lazy(() => import('./ServiceInstanceList'));
export const Details = React.lazy(() => import('./ServiceInstanceDetails'));
