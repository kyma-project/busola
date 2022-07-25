import React from 'react';

import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';

import { Rules } from './Rules';
import { RoleCreate } from './RoleCreate';

export function RoleDetails(props) {
  return (
    <ResourceDetails
      {...props}
      customComponents={[Rules]}
      createResourceForm={RoleCreate}
    />
  );
}

export default RoleDetails;
