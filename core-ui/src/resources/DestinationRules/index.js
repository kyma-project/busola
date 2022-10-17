import React from 'react';
import { ConfigFeaturesNames } from 'state/types';

export const resourceType = 'DestinationRules';
export const namespaced = true;
export const requiredFeatures = [ConfigFeaturesNames.ISTIO];
export const apiGroup = 'v1beta1';
export const apiVersion = 'networking.istio.io';

export const List = React.lazy(() => import('./DestinationRuleList'));
export const Details = React.lazy(() => import('./DestinationRuleDetails'));
