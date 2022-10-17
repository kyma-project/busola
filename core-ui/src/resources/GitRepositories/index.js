import React from 'react';
import { PredefinedCategories } from 'sidebar/constants';

export const resourceType = 'GitRepositories';
export const namespaced = true;
export const apiGroup = 'serverless.kyma-project.io';
export const apiVersion = 'v1alpha1';
export const category = PredefinedCategories.configuration;

export const List = React.lazy(() => import('./GitRepositoryList'));
export const Details = React.lazy(() => import('./GitRepositoryDetails'));

export const secrets = (t, context) => [
  {
    title: t('git-repositories.auth.basic'),
    data: ['username', 'password'],
  },
  {
    title: t('git-repositories.auth.ssh-key'),
    data: ['key'],
  },
];
