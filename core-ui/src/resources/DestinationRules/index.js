import React from 'react';
import { ConfigFeaturesNames } from 'state/types';
import { PredefinedCategories } from 'sidebar/constants';

export const resourceType = 'DestinationRules';
export const namespaced = true;
export const requiredFeatures = [ConfigFeaturesNames.ISTIO];
export const apiGroup = 'networking.istio.io';
export const apiVersion = 'v1beta1';
export const category = PredefinedCategories.istio;

export const List = React.lazy(() => import('./DestinationRuleList'));
export const Details = React.lazy(() => import('./DestinationRuleDetails'));
