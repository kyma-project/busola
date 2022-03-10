import React from 'react';
import { GenericList, ResourceStatus, ResourceDetails } from 'react-shared';
import { useTranslation } from 'react-i18next';
import { AddonsConfigurationsCreate } from '../../Create/AddonsConfigurations/AddonsConfigurations.create';

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

const AddonsConfigurationsDetailsNamespace = props => {
  return (
    <ResourceDetails
      customComponents={[RepositoryUrls]}
      createResourceForm={AddonsConfigurationsCreate}
      {...props}
    />
  );
};

export default AddonsConfigurationsDetailsNamespace;
