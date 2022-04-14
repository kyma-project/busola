import React from 'react';
import { AddonsConfigurations } from './AddonsConfigurations.js';
import { useTranslation } from 'react-i18next';

export const AddonsConfigurationsCreate = ({ resourceType, ...props }) => {
  const { t } = useTranslation();

  return (
    <AddonsConfigurations
      resourceType={resourceType}
      kind={t('addons.singular_name')}
      {...props}
    />
  );
};

export const ClusterAddonsConfigurationsCreate = ({
  resourceType,
  ...props
}) => {
  const { t } = useTranslation();

  return (
    <AddonsConfigurations
      resourceType={resourceType}
      kind={t('cluster-addons.singular_name')}
      {...props}
    />
  );
};
