import React from 'react';
import { useTranslation } from 'react-i18next';

import { GenericAddonsConfigurationCreate } from './GenericAddonsConfigurationCreate';

export function AddonsConfigurationCreate({ resourceType, ...props }) {
  const { t } = useTranslation();

  return (
    <GenericAddonsConfigurationCreate
      resourceType={resourceType}
      kind={t('addons.singular_name')}
      {...props}
    />
  );
}
