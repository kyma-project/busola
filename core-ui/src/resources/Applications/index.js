import React from 'react';
import { PredefinedCategories } from 'sidebar/constants';

export const resourceType = 'Applications';
export const namespaced = false;
export const apiGroup = 'applicationconnector.kyma-project.io';
export const apiVersion = 'v1alpha1';
export const category = PredefinedCategories.integration;

export const List = React.lazy(() => import('./ApplicationList'));
export const Details = React.lazy(() => import('./ApplicationDetails'));
