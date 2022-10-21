import React from 'react';
import { configFeaturesNames } from 'state/types';
import { predefinedCategories } from 'state/navigation/categories';

export const resourceType = 'AuthorizationPolicies';
export const namespaced = true;
export const requiredFeatures = [configFeaturesNames.ISTIO];

export const apiGroup = 'security.istio.io';
export const apiVersion = 'v1beta1';
export const category = predefinedCategories.istio;

export const List = React.lazy(() => import('./AuthorizationPolicyList'));
export const Details = React.lazy(() => import('./AuthorizationPolicyDetails'));
