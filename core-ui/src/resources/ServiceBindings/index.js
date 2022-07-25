import React from 'react';

export const resourceType = 'ServiceBindings';
export const namespaced = true;

export const List = React.lazy(() => import('./ServiceBindingList'));
export const Details = React.lazy(() => import('./ServiceBindingDetails'));
