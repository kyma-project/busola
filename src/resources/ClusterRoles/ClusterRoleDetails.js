import React from 'react';

import { Rules } from 'resources/Roles/Rules';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';

import { ClusterRoleCreate } from './ClusterRoleCreate';
import { description } from './ClusterRoleDescription';

const ClusterRolesDetails = props => {
  return (
    <ResourceDetails
      {...props}
      customComponents={[Rules]}
      createResourceForm={ClusterRoleCreate}
      description={description}
    />
  );
};

export default ClusterRolesDetails;
