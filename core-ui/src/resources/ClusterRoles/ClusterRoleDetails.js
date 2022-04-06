import React from 'react';

import { Rules } from 'resources/Roles/Rules';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';

import { ClusterRoleCreate } from './ClusterRoleCreate';

const ClusterRolesDetails = props => {
  return (
    <ResourceDetails
      {...props}
      customComponents={[Rules]}
      createResourceForm={ClusterRoleCreate}
    />
  );
};

export default ClusterRolesDetails;
