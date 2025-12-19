import { lazy } from 'react';

export const resourceType = 'ConfigMaps';
export const namespaced = false;

export const List = lazy(() => import('./BusolaExtensionList'));
