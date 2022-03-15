import React from 'react';
import { BindingsList } from './RoleBindings.list';
import { RoleBindingsCreate } from '../../Create/RoleBindings/RoleBindings.create';

function ClusterRoleBindingsList(props) {
  return (
    <BindingsList
      descriptionKey={'cluster-role-bindings.description'}
      createResourceForm={RoleBindingsCreate}
      {...props}
    />
  );
}
export default ClusterRoleBindingsList;
