import React from 'react';
import { useTranslation } from 'react-i18next';

import { GenericAddonsConfigurationCreate } from 'resources/AddonsConfigurations/GenericAddonsConfigurationCreate';

export function ClusterAddonsConfigurationCreate({ resourceType, ...props }) {
  const { t } = useTranslation();

  return (
    <GenericAddonsConfigurationCreate
      resourceType={resourceType}
      kind={t('cluster-addons.singular_name')}
      {...props}
    />
  );
}
