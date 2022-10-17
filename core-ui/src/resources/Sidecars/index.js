import React from 'react';
import { ConfigFeaturesNames } from 'state/types';

export const resourceType = 'Sidecars';
export const namespaced = true;
export const requiredFeatures = [ConfigFeaturesNames.ISTIO];

export const List = React.lazy(() => import('./SidecarList'));
export const Details = React.lazy(() => import('./SidecarDetails'));
