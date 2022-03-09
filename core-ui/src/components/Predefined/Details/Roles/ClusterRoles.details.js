import React from 'react';
import { Rules } from './Rules.js';
import { usePrepareListProps } from 'routing/common';
import { ResourceDetails } from 'react-shared';

const ClusterRolesDetails = () => {
  const params = usePrepareListProps('clusterroles');
  return <ResourceDetails {...params} customComponents={[Rules]} />;
};

export default ClusterRolesDetails;
