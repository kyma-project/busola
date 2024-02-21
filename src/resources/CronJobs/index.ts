import React from 'react';
import { ResourceRelationConfig } from 'shared/components/ResourceGraph/types';
import { predefinedCategories } from 'state/navigation/categories';

export const resourceType = 'CronJobs';
export const namespaced = true;
export const apiGroup = 'batch';
export const apiVersion = 'v1';
export const category = predefinedCategories.workloads;

export const cronJobI18nDescriptionKey = 'cron-jobs.description';
export const cronJobDocsURL =
  'https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/';

export const List = React.lazy(() => import('./CronJobList'));
export const Details = React.lazy(() => import('./CronJobDetails'));

export const resourceGraphConfig = (): ResourceRelationConfig => ({
  networkFlowKind: true,
  networkFlowLevel: -2,
});
