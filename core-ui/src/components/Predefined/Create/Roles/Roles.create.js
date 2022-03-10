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
RolesCreate.resourceGraphConfig = (t, context) => ({
  relations: [
    {
      kind: 'RoleBinding',
    },
  ],
  matchers: {
    RoleBinding: (cr, rb) =>
      rb.roleRef.kind === 'Role' && rb.roleRef.name === cr.metadata.name,
  },
  depth: 2,
});

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
ClusterRolesCreate.resourceGraphConfig = (t, context) => ({
  relations: [
    {
      kind: 'ClusterRoleBinding',
    },
    {
      kind: 'RoleBinding',
    },
  ],
  depth: 2,
  matchers: {
    ClusterRoleBinding: (cr, crb) =>
      crb.roleRef.kind === 'ClusterRole' &&
      crb.roleRef.name === cr.metadata.name,
    RoleBinding: (cr, rb) =>
      rb.roleRef.kind === 'ClusterRole' && rb.roleRef.name === cr.metadata.name,
  },
});

export { RolesCreate, ClusterRolesCreate };
