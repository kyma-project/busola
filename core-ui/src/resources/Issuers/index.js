import React from 'react';
import { PredefinedCategories } from 'state/navigation/categories';

export const resourceType = 'Issuers';
export const namespaced = true;
export const apiGroup = 'cert.gardener.cloud';
export const apiVersion = 'v1alpha1';
export const category = PredefinedCategories.configuration;

export const List = React.lazy(() => import('./IssuerList'));
export const Details = React.lazy(() => import('./IssuerDetails'));
