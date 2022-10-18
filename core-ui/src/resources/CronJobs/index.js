import React from 'react';
import { PredefinedCategories } from 'state/navigation/categories';

export const resourceType = 'CronJobs';
export const namespaced = true;
export const apiGroup = 'batch';
export const apiVersion = 'v1';
export const category = PredefinedCategories.workloads;

export const List = React.lazy(() => import('./CronJobList'));
export const Details = React.lazy(() => import('./CronJobDetails'));

export const resourceGraphConfig = (t, context) => ({
  networkFlowKind: true,
  networkFlowLevel: -2,
});
