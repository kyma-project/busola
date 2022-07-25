import React from 'react';

export const resourceType = 'AddonsConfigurations';
export const namespaced = true;

export const List = React.lazy(() => import('./AddonsConfigurationList'));
export const Details = React.lazy(() => import('./AddonsConfigurationDetails'));
