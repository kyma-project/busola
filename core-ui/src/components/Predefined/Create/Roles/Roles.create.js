import React from 'react';
import { useTranslation } from 'react-i18next';

import { createRoleTemplate, createClusterRoleTemplate } from './helpers';
import { useMicrofrontendContext } from 'react-shared';
import { GenericRoleCreate } from './GenericRoleCreate';

function RolesCreate(props) {
  const { t } = useTranslation();
  const { namespaceId: namespace } = useMicrofrontendContext();
  return (
    <GenericRoleCreate
      {...props}
      pluralKind="roles"
      singularName={t('roles.name_singular')}
      createTemplate={() => createRoleTemplate(namespace)}
    />
  );
}
RolesCreate.allowEdit = true;
RolesCreate.allowClone = true;

function ClusterRolesCreate(props) {
  const { t } = useTranslation();
  return (
    <GenericRoleCreate
      {...props}
      pluralKind="clusterroles"
      singularName={t('cluster-roles.name_singular')}
      createTemplate={createClusterRoleTemplate}
    />
  );
}
ClusterRolesCreate.allowEdit = true;
ClusterRolesCreate.allowClone = true;

export { RolesCreate, ClusterRolesCreate };
