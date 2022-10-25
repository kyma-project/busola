import React from 'react';
import { configFeaturesNames } from 'state/types';
import { predefinedCategories } from 'state/navigation/categories';

export const resourceType = 'ServiceEntries';
export const namespaced = true;
export const requiredFeatures = [configFeaturesNames.ISTIO];
export const apiGroup = 'networking.istio.io';
export const apiVersion = 'v1beta1';
export const category = predefinedCategories.istio;

export const List = React.lazy(() => import('./ServiceEntryList'));
export const Details = React.lazy(() => import('./ServiceEntryDetails'));
