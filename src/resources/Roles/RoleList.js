import { GenericRoleList } from './GenericRoleList';
import { RoleCreate } from './RoleCreate';
import { ResourceDescription, i18nDescriptionKey } from 'resources/Roles/index';

export function RoleList(props) {
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
