import React from 'react';

import { GenericRoleBindingDetails } from 'resources/RoleBindings/GenericRoleBindingDetails';

import { ClusterRoleBindingCreate } from './ClusterRoleBindingCreate';

export function ClusterRoleBindingsDetails(props) {
  return (
    <GenericRoleBindingDetails
      {...props}
      createResourceForm={ClusterRoleBindingCreate}
    />
  );
}

export default ClusterRoleBindingsDetails;
