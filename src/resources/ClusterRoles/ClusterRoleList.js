import React from 'react';
import { GenericRoleList } from 'resources/Roles/GenericRoleList';
import { ClusterRoleCreate } from './ClusterRoleCreate';
import { description, descriptionKey } from './ClusterRoleDescription';

export function ClusterList(props) {
  return (
    <GenericRoleList
      description={description}
      descriptionKey={descriptionKey}
      {...props}
      createResourceForm={ClusterRoleCreate}
    />
  );
}

export default ClusterList;
