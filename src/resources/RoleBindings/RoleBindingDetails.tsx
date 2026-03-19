import RoleBindingCreate from './RoleBindingCreate';
import { GenericRoleBindingDetails } from './GenericRoleBindingDetails';
import { ResourceDescription } from 'resources/RoleBindings';

interface RoleBindingsDetailsProps {
  [key: string]: any;
}

export function RoleBindingsDetails(props: RoleBindingsDetailsProps) {
  return (
    <GenericRoleBindingDetails
      {...props}
      description={ResourceDescription}
      createResourceForm={RoleBindingCreate}
    />
  );
}

export default RoleBindingsDetails;
