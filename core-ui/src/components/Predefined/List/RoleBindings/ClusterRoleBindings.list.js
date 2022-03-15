import React from 'react';
import { BindingsList } from './RoleBindings.list';

function ClusterRoleBindingsList(props) {
  return (
    <BindingsList
      descriptionKey={'cluster-role-bindings.description'}
      {...props}
    />
  );
}
export default ClusterRoleBindingsList;
