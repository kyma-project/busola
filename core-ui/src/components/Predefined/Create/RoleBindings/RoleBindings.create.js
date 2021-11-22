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
export { RoleBindingsCreate, ClusterRoleBindingsCreate };
