import React from 'react';

export const resourceType = 'ServiceEntries';
export const namespaced = true;

export const List = React.lazy(() => import('./ServiceEntryList'));
export const Details = React.lazy(() => import('./ServiceEntryDetails'));
