import React from 'react';

export const resourceType = 'DestinationRules';
export const namespaced = true;

export const List = React.lazy(() => import('./DestinationRuleList'));
export const Details = React.lazy(() => import('./DestinationRuleDetails'));
