import React from 'react';

export const resourceType = 'ServiceBrokers';
export const namespaced = true;

export const List = React.lazy(() => import('./ServiceBrokerList'));
