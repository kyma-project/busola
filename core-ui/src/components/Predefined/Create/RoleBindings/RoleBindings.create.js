import React from 'react';
import { RoleBindings } from './RoleBindings.js';
import { useTranslation } from 'react-i18next';
function RoleBindingsCreate(props) {
  const { t } = useTranslation();
  return (
    <RoleBindings
      {...props}
      pluralKind="rolebindings"
      singularName={t(`role-bindings.name_singular`)}
    />
  );
}
RoleBindingsCreate.allowEdit = true;
RoleBindingsCreate.resourceGraphConfig = (t, context) => ({
  relations: [
    {
      kind: 'ClusterRole',
      clusterwide: true,
    },
    {
      kind: 'Role',
    },
    {
      kind: 'ServiceAccount',
    },
  ],
  depth: 1,
});

function ClusterRoleBindingsCreate(props) {
  const { t } = useTranslation();
  return (
    <RoleBindings
      {...props}
      pluralKind="clusterrolebindings"
      singularName={t(`cluster-role-bindings.name_singular`)}
    />
  );
}
ClusterRoleBindingsCreate.allowEdit = true;
ClusterRoleBindingsCreate.resourceGraphConfig = (t, context) => ({
  relations: [
    {
      kind: 'ClusterRole',
    },
    {
      kind: 'ServiceAccount',
    },
  ],
  depth: 1,
});

export { RoleBindingsCreate, ClusterRoleBindingsCreate };
