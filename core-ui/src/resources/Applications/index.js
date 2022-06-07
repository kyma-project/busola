import React from 'react';

export const resourceType = 'Applications';
export const namespaced = false;
export const navData = {
  category: 'Xxx',
  label: resourceType,
};

export const List = React.lazy(() => import('./ApplicationList'));
export const Details = React.lazy(() => import('./ApplicationDetails'));
