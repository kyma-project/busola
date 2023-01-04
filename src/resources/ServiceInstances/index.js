import React from 'react';
import { predefinedCategories } from 'state/navigation/categories';

export const resourceType = 'ServiceInstances';
export const namespaced = true;
export const apiGroup = 'services.cloud.sap.com';
export const apiVersion = 'v1';
export const category = predefinedCategories['service-management'];

export const List = React.lazy(() => import('./ServiceInstanceList'));
export const Details = React.lazy(() => import('./ServiceInstanceDetails'));
