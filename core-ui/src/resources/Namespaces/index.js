import React from 'react';
import { PredefinedCategories } from 'sidebar/constants';

export const resourceType = 'namespaces';
export const namespaced = false;
export const apiGroup = '';
export const apiVersion = 'v1';
export const category = PredefinedCategories.temporary;

export const List = React.lazy(() => import('./NamespaceList'));
export const Details = React.lazy(() => import('./NamespaceDetails'));
