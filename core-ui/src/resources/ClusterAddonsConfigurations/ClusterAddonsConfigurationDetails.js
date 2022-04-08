import React from 'react';

import { GenericAddonsConfigurationDetails } from 'resources/AddonsConfigurations/GenericAddonsConfigurationDetails';
import { ClusterAddonsConfigurationCreate } from './ClusterAddonsConfigurationCreate';

export function ClusterAddonsConfigurationDetails(props) {
  return (
    <GenericAddonsConfigurationDetails
      createResourceForm={ClusterAddonsConfigurationCreate}
      {...props}
    />
  );
}

export default ClusterAddonsConfigurationDetails;
