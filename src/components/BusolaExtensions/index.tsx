import { lazyWithRetries } from 'shared/helpers/lazyWithRetries';

export const resourceType = 'ConfigMaps';
export const namespaced = false;

export const List = lazyWithRetries(() => import('./BusolaExtensionList'));
