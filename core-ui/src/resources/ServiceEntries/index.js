import React from 'react';
import { ConfigFeaturesNames } from 'state/types';

export const resourceType = 'ServiceEntries';
export const namespaced = true;
export const requiredFeatures = [ConfigFeaturesNames.ISTIO];

export const List = React.lazy(() => import('./ServiceEntryList'));
export const Details = React.lazy(() => import('./ServiceEntryDetails'));
