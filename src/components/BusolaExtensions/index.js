import React from 'react';

export const resourceType = 'ConfigMaps';
export const namespaced = false;

export const List = React.lazy(() => import('./BusolaPluginList'));
