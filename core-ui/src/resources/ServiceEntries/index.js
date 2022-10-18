import React from 'react';
import { ConfigFeaturesNames } from 'state/types';
import { PredefinedCategories } from 'state/navigation/categories';

export const resourceType = 'ServiceEntries';
export const namespaced = true;
export const requiredFeatures = [ConfigFeaturesNames.ISTIO];
export const apiGroup = 'networking.istio.io';
export const apiVersion = 'v1beta1';
export const category = PredefinedCategories.istio;

export const List = React.lazy(() => import('./ServiceEntryList'));
export const Details = React.lazy(() => import('./ServiceEntryDetails'));
