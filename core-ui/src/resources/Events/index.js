import React from 'react';

export const resourceType = 'Events';
export const namespaced = true;

export const List = React.lazy(() => import('./EventList'));
export const Details = React.lazy(() => import('./EventDetails'));
