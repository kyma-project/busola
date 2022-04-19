import React from 'react';
import { useTranslation } from 'react-i18next';
import { GenericRoleBindingCreate } from 'resources/RoleBindings/GenericRoleBindingCreate';

export function ClusterRoleBindingCreate(props) {
  const { t } = useTranslation();
  return (
    <GenericRoleBindingCreate
      {...props}
      pluralKind="clusterrolebindings"
      singularName={t(`cluster-role-bindings.name_singular`)}
    />
  );
}
ClusterRoleBindingCreate.allowEdit = true;
