import React from 'react';
import { ResourceRelationConfig } from 'shared/components/ResourceGraph/types';
import { matchByOwnerReference } from 'shared/utils/helpers';
import { predefinedCategories } from 'state/navigation/categories';

export const resourceType = 'Jobs';
export const namespaced = true;
export const label = 'jobs.title';
export const apiGroup = 'batch';
export const apiVersion = 'v1';
export const category = predefinedCategories.workloads;

export const List = React.lazy(() => import('./JobList'));
export const Details = React.lazy(() => import('./JobDetails'));

export const resourceGraphConfig = (): ResourceRelationConfig => ({
  networkFlowKind: true,
  networkFlowLevel: -1,
  depth: 1,
  relations: [
    {
      resource: { kind: 'CronJob' },
      filter: (job, cronJob) =>
        matchByOwnerReference({ resource: job, owner: cronJob }),
    },
    {
      resource: { kind: 'Function' },
      filter: (job, functión) =>
        matchByOwnerReference({
          resource: job,
          owner: functión,
        }),
    },
  ],
});
