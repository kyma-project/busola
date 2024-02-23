import { GenericRoleBindingDetails } from 'resources/RoleBindings/GenericRoleBindingDetails';

import ClusterRoleBindingCreate from './ClusterRoleBindingCreate';
import { ResourceDescription } from 'resources/ClusterRoleBindings';

export function ClusterRoleBindingsDetails(props) {
  return (
    <GenericRoleBindingDetails
      {...props}
      description={ResourceDescription}
      createResourceForm={ClusterRoleBindingCreate}
    />
  );
}

export default ClusterRoleBindingsDetails;
