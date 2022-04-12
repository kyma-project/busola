import React from 'react';

export const resourceType = 'Sidecars';
export const namespaced = true;

export const List = React.lazy(() => import('./SidecarList'));
export const Details = React.lazy(() => import('./SidecarDetails'));
