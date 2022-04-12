import React from 'react';

export const resourceType = 'CronJobs';
export const namespaced = true;

export const List = React.lazy(() => import('./CronJobList'));
export const Details = React.lazy(() => import('./CronJobDetails'));

export const resourceGraphConfig = (t, context) => ({
  networkFlowKind: true,
  networkFlowLevel: -2,
  relations: [
    {
      kind: 'Job',
    },
  ],
});
