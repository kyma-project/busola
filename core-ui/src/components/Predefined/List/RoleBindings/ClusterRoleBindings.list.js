import React from 'react';
import { BindingsList } from './RoleBindings.list';
import { ClusterRoleBindingsCreate } from '../../Create/RoleBindings/RoleBindings.create';

function ClusterRoleBindingsList(props) {
  return (
    <BindingsList
      descriptionKey={'cluster-role-bindings.description'}
      createResourceForm={ClusterRoleBindingsCreate}
      {...props}
    />
  );
}
export default ClusterRoleBindingsList;
