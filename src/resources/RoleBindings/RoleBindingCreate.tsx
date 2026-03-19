import { useTranslation } from 'react-i18next';

import { GenericRoleBindingCreate } from './GenericRoleBindingCreate';

interface RoleBindingCreateProps {
  [key: string]: any;
}

export default function RoleBindingCreate(props: RoleBindingCreateProps) {
  const { t } = useTranslation();
  return (
    <GenericRoleBindingCreate
      {...(props as any)}
      pluralKind="rolebindings"
      singularName={t(`role-bindings.name_singular`)}
    />
  );
}
