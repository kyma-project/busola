import React from 'react';
import { Rules } from './Rules.js';
import { ResourceDetails } from 'react-shared';

const ClusterRolesDetails = props => {
  return <ResourceDetails {...props} customComponents={[Rules]} />;
};

export default ClusterRolesDetails;
