import React from 'react';
import { useTranslation } from 'react-i18next';

import { GenericRoleBindingCreate } from './GenericRoleBindingCreate';

export default function RoleBindingCreate(props) {
  const { t } = useTranslation();
  return (
    <GenericRoleBindingCreate
      {...props}
      pluralKind="rolebindings"
      singularName={t(`role-bindings.name_singular`)}
    />
  );
}
