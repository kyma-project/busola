import React from 'react';
import { GenericList, StatusBadge } from 'react-shared';
import { useTranslation } from 'react-i18next';

const RepositoryUrls = addon => {
  const { t, i18n } = useTranslation();

  const headerRenderer = _ => [
    t('addons.headers.url'),
    t('common.headers.status'),
  ];

  const rowRenderer = repo => [
    repo.url,
    <StatusBadge
      resourceKind="addons"
      ariaLabel={t('addons.addons-status')}
      additionalContent={repo.message}
      autoResolveType
      i18n={i18n}
      noTooltip={repo.status === 'Ready'}
    >
      {repo.status}
    </StatusBadge>,
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

export const AddonsConfigurationsDetails = ({
  DefaultRenderer,
  ...otherParams
}) => {
  return (
    <DefaultRenderer customComponents={[RepositoryUrls]} {...otherParams} />
  );
};
export const ClusterAddonsConfigurationsDetails = AddonsConfigurationsDetails;
