import React from 'react';

export const resourceType = 'namespaces';
export const namespaced = false;

export const List = React.lazy(() => import('./NamespaceList'));
export const Details = React.lazy(() => import('./NamespaceDetails'));
