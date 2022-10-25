import React from 'react';
import { predefinedCategories } from 'state/navigation/categories';

export const resourceType = 'Applications';
export const namespaced = false;
export const apiGroup = 'applicationconnector.kyma-project.io';
export const apiVersion = 'v1alpha1';
export const category = predefinedCategories.integration;

export const List = React.lazy(() => import('./ApplicationList'));
export const Details = React.lazy(() => import('./ApplicationDetails'));
