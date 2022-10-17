import React from 'react';
import { ConfigFeaturesNames } from 'state/types';
import { PredefinedCategories } from 'sidebar/constants';

export const resourceType = 'AuthorizationPolicies';
export const namespaced = true;
export const requiredFeatures = [ConfigFeaturesNames.ISTIO];

export const apiGroup = 'security.istio.io';
export const apiVersion = 'v1beta1';
export const category = PredefinedCategories.istio;

export const List = React.lazy(() => import('./AuthorizationPolicyList'));
export const Details = React.lazy(() => import('./AuthorizationPolicyDetails'));
