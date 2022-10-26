import React from 'react';

export const resourceType = 'namespaces';
export const namespaced = false;
export const apiGroup = '';
export const apiVersion = 'v1';
export const category = '';
export const icon = 'message-warning';
export const topLevelNode = true;

export const List = React.lazy(() => import('./NamespaceList'));
export const Details = React.lazy(() => import('./NamespaceDetails'));
