import React from 'react';
import { GenericList, StatusBadge } from 'react-shared';
import { useTranslation } from 'react-i18next';

const RepositoryUrls = addon => {
  const { t } = useTranslation();

  const headerRenderer = _ => [
    t('addons.headers.url'),
    t('common.headers.status'),
  ];
  const rowRenderer = repo => [
    repo.url,
    <StatusBadge
      ariaLabel={t('addons.addons-status')}
      tooltipContent={repo.message}
      autoResolveType
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
