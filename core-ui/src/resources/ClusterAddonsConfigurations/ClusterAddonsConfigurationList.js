import React from 'react';

import { GenericAddonsConfigurationList } from 'resources/AddonsConfigurations/GenericAddonsConfigurationList';

import { ClusterAddonsConfigurationCreate } from './ClusterAddonsConfigurationCreate';

export function ClusterAddonsConfigurationsList(props) {
  return (
    <GenericAddonsConfigurationList
      descriptionKey={'cluster-addons.description'}
      documentationLink={
        'https://kyma-project-old.netlify.app/docs/components/helm-broker#custom-resource-cluster-addons-configuration'
      }
      createResourceForm={ClusterAddonsConfigurationCreate}
      {...props}
    />
  );
}
export default ClusterAddonsConfigurationsList;
