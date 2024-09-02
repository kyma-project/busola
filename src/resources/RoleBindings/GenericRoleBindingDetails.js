import React from 'react';

import { RoleSubjects } from './RoleSubjects.js';
import { RoleRef } from './RoleRef';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';

export function GenericRoleBindingDetails({
  DefaultRenderer,
  description,
  ...otherParams
}) {
  return (
    <ResourceDetails
      {...otherParams}
      description={description}
      customComponents={[RoleRef, RoleSubjects]}
    />
  );
}
