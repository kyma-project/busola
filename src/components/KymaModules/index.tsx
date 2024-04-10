import React from 'react';

export const resourceType = 'Kyma';
export const namespaced = false;

export const List = React.lazy(() => import('./KymaModulesList'));
export const Create = React.lazy(() => import('./KymaModulesCreate'));
