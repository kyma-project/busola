import React from 'react';
import { useTranslation } from 'react-i18next';

import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';

import { createRoleTemplate, createRolePresets } from './helpers';
import { GenericRoleCreate } from './GenericRoleCreate';

export function RoleCreate(props) {
  const { t } = useTranslation();
  const { namespaceId: namespace, groupVersions } = useMicrofrontendContext();

  return (
    <GenericRoleCreate
      {...props}
      pluralKind="roles"
      singularName={t('roles.name_singular')}
      createTemplate={() => createRoleTemplate(namespace)}
      presets={createRolePresets(namespace, t, groupVersions)}
    />
  );
}
RoleCreate.allowEdit = true;
RoleCreate.allowClone = true;
