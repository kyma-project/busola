import React from 'react';
import { Rules } from './Rules.js';
import { ResourceDetails } from 'react-shared';
import { RolesCreate } from '../../Create/Roles/Roles.create';

export const RolesDetails = props => {
  return (
    <ResourceDetails
      {...props}
      customComponents={[Rules]}
      createResourceForm={RolesCreate}
    />
  );
};

export const ClusterRolesDetails = ({ DefaultRenderer, ...otherParams }) => {
  return <DefaultRenderer {...otherParams} customComponents={[Rules]} />;
};
export default RolesDetails;
