import { GenericRoleList } from './GenericRoleList';
import RoleCreate from './RoleCreate';
import { ResourceDescription, i18nDescriptionKey } from 'resources/Roles';

interface RoleListProps {
  [key: string]: any;
}

export function RoleList(props: RoleListProps) {
  return (
    <GenericRoleList
      description={ResourceDescription}
      descriptionKey={i18nDescriptionKey}
      {...props}
      createResourceForm={RoleCreate}
    />
  );
}

export default RoleList;
