import React from 'react';
import { Rules } from './Rules.js';

function GenericRoleDetails({ DefaultRenderer, ...otherParams }) {
  return (
    <DefaultRenderer
      {...otherParams}
      customComponents={[Rules]}
      resourceGraphProps={{ depth: 2 }}
    />
  );
}

export const RolesDetails = GenericRoleDetails;
export const ClusterRolesDetails = GenericRoleDetails;
