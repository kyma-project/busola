import React from 'react';
import { useTranslation } from 'react-i18next';

import { ResourceStatus } from 'shared/components/ResourceStatus/ResourceStatus';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { GenericList } from 'shared/components/GenericList/GenericList';

import { AddonsConfigurationCreate } from './AddonsConfigurationCreate';

export const RepositoryUrls = addon => {
  const { t, i18n } = useTranslation();

  const headerRenderer = _ => [
    t('addons.headers.url'),
    t('common.headers.status'),
  ];

  const rowRenderer = repo => [
    repo.url,
    <ResourceStatus status={repo} i18n={i18n} />,
  ];

  return (
    <GenericList
      key="repository-urls"
      title={t('addons.repository-urls')}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      entries={addon.status.repositories || []}
      i18n={i18n}
    />
  );
};

export function GenericAddonsConfigurationDetails(props) {
  return <ResourceDetails customComponents={[RepositoryUrls]} {...props} />;
}
