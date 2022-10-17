import React from 'react';

import { matchByOwnerReference } from 'shared/utils/helpers';
import i18next from 'i18next';
import { PredefinedCategories } from 'sidebar/constants';

export const resourceType = 'Jobs';
export const namespaced = true;
export const label = 'jobs.title';
export const apiGroup = '';
export const apiVersion = 'batch/v1';
export const category = PredefinedCategories.workloads;

export const List = React.lazy(() => import('./JobList'));
export const Details = React.lazy(() => import('./JobDetails'));

export const resourceGraphConfig = (t, context) => ({
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

const luigi = {
  category: i18next.t('workloads.title'), // zostaje jako categoryID

  ///
  categoryIcon: 'jklsdf', // domyslne
  dependsOnFeatures: ['ISTIO'],
  ////

  resourceType: 'jobs', // brane z linii 8, change case

  //optional
  pathSegment: 'jobs', // może być opcjonalnie, ma byc tylko jak jest inny od resourceType
  //pathSegemnt to urlPath w ext config

  //optional
  label: i18next.t('jobs.title'), // if defined, overwrite name in nav
  // label is overwritten by ext name

  /// osobno apiVersion, apiGroup, hasDetailsView, fn do kompilowania tego dla kubernetesa
  // viewUrl:
  // config.coreUIModuleUrl +
  // '/namespaces/:namespaceId/jobs?' +
  // toSearchParamsString({
  //   resourceApiPath: '/apis/batch/v1',
  //   hasDetailsView: true, // move 1 level up
  // }),
  // viewGroup: coreUIViewGroupName,
  // keepSelectedForChildren: true,

  // navigationContext: 'jobs',
  // children: [
  //   {
  //     pathSegment: 'details',
  //     children: [
  //       {
  //         pathSegment: ':jobName',
  //         resourceType: 'jobs',
  //         viewUrl:
  //           config.coreUIModuleUrl +
  //           '/namespaces/:namespaceId/jobs/:jobName?' +
  //           toSearchParamsString({
  //             resourceApiPath: '/apis/batch/v1',
  //           }),
  //       },
  //     ],
  //   },
  // ],
};
