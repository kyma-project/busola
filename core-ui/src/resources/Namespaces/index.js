import React from 'react';

export const resourceType = 'namespaces';
export const namespaced = false;

export const List = React.lazy(() => import('./NamespacesList'));
export const Details = React.lazy(() => import('./NamespacesDetails'));
