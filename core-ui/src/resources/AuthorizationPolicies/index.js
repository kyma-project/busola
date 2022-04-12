import React from 'react';

export const resourceType = 'AuthorizationPolicies';
export const namespaced = true;

export const List = React.lazy(() => import('./AuthorizationPolicyList'));
export const Details = React.lazy(() => import('./AuthorizationPolicyDetails'));
