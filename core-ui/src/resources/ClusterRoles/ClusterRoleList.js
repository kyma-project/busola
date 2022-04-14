import React from 'react';
import { GenericRoleList } from 'resources/Roles/GenericRoleList';
import { ClusterRoleCreate } from './ClusterRoleCreate';

export function ClusterList(props) {
  return (
    <GenericRoleList
      descriptionKey={'cluster-roles.description'}
      {...props}
      createResourceForm={ClusterRoleCreate}
    />
  );
}

export default ClusterList;
