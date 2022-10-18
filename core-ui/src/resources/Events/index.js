import React from 'react';
import { PredefinedCategories } from 'state/navigation/categories';

export const resourceType = 'Events';
export const namespaced = true;
export const apiGroup = '';
export const apiVersion = 'v1';
export const category = PredefinedCategories.temporary;

export const List = React.lazy(() => import('./EventList'));
export const Details = React.lazy(() => import('./EventDetails'));
