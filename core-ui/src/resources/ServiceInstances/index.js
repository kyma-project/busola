import React from 'react';

export const resourceType = 'ServiceInstances';
export const namespaced = true;
export const apiGroup = 'services.cloud.sap.com';
export const apiVersion = 'v1';

export const List = React.lazy(() => import('./ServiceInstanceList'));
export const Details = React.lazy(() => import('./ServiceInstanceDetails'));
