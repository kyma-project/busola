import React from 'react';

import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';

import { Rules } from './Rules';
import { RoleCreate } from './RoleCreate';
import { description } from './RoleDescription';

export function RoleDetails(props) {
  return (
    <ResourceDetails
      {...props}
      customComponents={[Rules]}
      createResourceForm={RoleCreate}
      description={description}
    />
  );
}

export default RoleDetails;
