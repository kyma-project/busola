import React from 'react';

import { GenericRoleBindingList } from 'resources/RoleBindings/GenericRoleBindingList';

import { ClusterRoleBindingCreate } from './ClusterRoleBindingCreate';

export function ClusterRoleBindingList(props) {
  return (
    <GenericRoleBindingList
      descriptionKey={'cluster-role-bindings.description'}
      {...props}
      createResourceForm={ClusterRoleBindingCreate}
    />
  );
}
export default ClusterRoleBindingList;
