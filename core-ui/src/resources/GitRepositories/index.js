import React from 'react';

export const resourceType = 'GitRepositories';
export const namespaced = true;

export const List = React.lazy(() => import('./GitRepositoryList'));
export const Details = React.lazy(() => import('./GitRepositoryDetails'));

export const secrets = (t, context) => [
  {
    title: t('git-repositories.secret-basic'),
    data: ['username', 'password'],
  },
  {
    title: t('git-repositories.secret-ssh-key'),
    data: ['key'],
  },
];
