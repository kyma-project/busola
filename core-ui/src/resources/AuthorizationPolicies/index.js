import React from 'react';
import { ConfigFeaturesNames } from 'state/types';

export const resourceType = 'AuthorizationPolicies';
export const namespaced = true;
export const requiredFeatures = [ConfigFeaturesNames.ISTIO];

export const List = React.lazy(() => import('./AuthorizationPolicyList'));
export const Details = React.lazy(() => import('./AuthorizationPolicyDetails'));
