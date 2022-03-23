import React from 'react';
import { RepositoryUrls } from './AddonsConfigurationNamespace.details';
import { ResourceDetails } from 'react-shared';
import { ClusterAddonsConfigurationsCreate } from 'components/Predefined/Create/AddonsConfigurations/AddonsConfigurations.create';

const AddonsConfigurationsDetailsCluster = props => {
  return (
    <ResourceDetails
      customComponents={[RepositoryUrls]}
      createResourceForm={ClusterAddonsConfigurationsCreate}
      {...props}
    />
  );
};

export default AddonsConfigurationsDetailsCluster;
