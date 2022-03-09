import React from 'react';
import { GenericRolesList } from './Roles.list';
import { ClusterRolesCreate } from '../Create/Roles/Roles.create';
import { usePrepareListProps } from 'routing/common';

const ClusterList = () => {
  const params = usePrepareListProps('clusterroles');
  return (
    <GenericRolesList
      descriptionKey={'cluster-roles.description'}
      {...params}
      createResourceForm={ClusterRolesCreate}
    />
  );
};

export default ClusterList;
