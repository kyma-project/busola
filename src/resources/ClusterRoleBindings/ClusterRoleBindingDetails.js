import React from 'react';

import { GenericRoleBindingDetails } from 'resources/RoleBindings/GenericRoleBindingDetails';

import { ClusterRoleBindingCreate } from './ClusterRoleBindingCreate';
import { description } from 'resources/ClusterRoleBindings/ClusterRoleBindingDescription';

export function ClusterRoleBindingsDetails(props) {
  return (
    <GenericRoleBindingDetails
      {...props}
      description={description}
      createResourceForm={ClusterRoleBindingCreate}
    />
  );
}

export default ClusterRoleBindingsDetails;
