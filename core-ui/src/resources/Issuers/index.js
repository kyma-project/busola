import React from 'react';

export const resourceType = 'Issuers';
export const namespaced = true;

export const List = React.lazy(() => import('./IssuerList'));
export const Details = React.lazy(() => import('./IssuerDetails'));
