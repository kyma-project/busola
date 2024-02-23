import React from 'react';
import { ResourceRelationConfig } from 'shared/components/ResourceGraph/types';
import { predefinedCategories } from 'state/navigation/categories';
import { Description } from 'shared/components/Description/Description';

export const resourceType = 'CronJobs';
export const namespaced = true;
export const apiGroup = 'batch';
export const apiVersion = 'v1';
export const category = predefinedCategories.workloads;

export const i18nDescriptionKey = 'cron-jobs.description';
export const docsURL =
  'https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/';

export const ResourceDescription = (
  <Description i18nKey={i18nDescriptionKey} url={docsURL} />
);

export const List = React.lazy(() => import('./CronJobList'));
export const Details = React.lazy(() => import('./CronJobDetails'));
export const Create = React.lazy(() => import('./CronJobCreate'));

export const resourceGraphConfig = (): ResourceRelationConfig => ({
  networkFlowKind: true,
  networkFlowLevel: -2,
});
