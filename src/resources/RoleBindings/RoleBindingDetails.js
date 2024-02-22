import { RoleBindingCreate } from './RoleBindingCreate';
import { GenericRoleBindingDetails } from './GenericRoleBindingDetails';
import { ResourceDescription } from 'resources/RoleBindings/index';

export function RoleBindingsDetails(props) {
  return (
    <GenericRoleBindingDetails
      {...props}
      description={ResourceDescription}
      createResourceForm={RoleBindingCreate}
    />
  );
}

export default RoleBindingsDetails;
