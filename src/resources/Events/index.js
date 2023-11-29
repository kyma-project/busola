import React from 'react';

export const resourceType = 'Events';
export const namespaced = true;
export const apiGroup = '';
export const apiVersion = 'v1';
export const category = '';
export const icon = 'warning2';
export const topLevelNode = true;

export const List = React.lazy(() => import('./EventList'));
export const Details = React.lazy(() => import('./EventDetails'));
