import React from 'react';
import { GenericRolesList } from './Roles.list';
import { ClusterRolesCreate } from '../Create/Roles/Roles.create';

const ClusterList = props => {
  return (
    <GenericRolesList
      descriptionKey={'cluster-roles.description'}
      {...props}
      createResourceForm={ClusterRolesCreate}
    />
  );
};

export default ClusterList;
