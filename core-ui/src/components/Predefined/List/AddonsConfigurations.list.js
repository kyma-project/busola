import React from 'react';
import { StatusBadge } from 'react-shared';
import { useTranslation } from 'react-i18next';

export const AddonsConfigurationsList = ({
  DefaultRenderer,
  ...otherParams
}) => {
  const { t } = useTranslation();

  const statusColumn = {
    header: t('common.headers.status'),
    value: addon => (
      <StatusBadge autoResolveType>{addon.status?.phase}</StatusBadge>
    ),
  };

  const customColumns = [statusColumn];
  return <DefaultRenderer customColumns={customColumns} {...otherParams} />;
};

export const ClusterAddonsConfigurationsList = AddonsConfigurationsList;
