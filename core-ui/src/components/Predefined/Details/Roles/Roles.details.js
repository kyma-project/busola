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

export function RolesDetails(props) {
  return <GenericRoleDetails {...props} />;
}

export function ClusterRolesDetails(props) {
  return <GenericRoleDetails {...props} />;
}
