import React from 'react';
import { GenericAddonsConfigurationsList } from './AddonsConfigurations.list';
import { ClusterAddonsConfigurationsCreate } from '../../Create/AddonsConfigurations/AddonsConfigurations.create';

function ClusterAddonsConfigurationsList(props) {
  return (
    <GenericAddonsConfigurationsList
      descriptionKey={'cluster-addons.description'}
      documentationLink={
        'https://kyma-project-old.netlify.app/docs/components/helm-broker#custom-resource-cluster-addons-configuration'
      }
      createResourceForm={ClusterAddonsConfigurationsCreate}
      {...props}
    />
  );
}
export default ClusterAddonsConfigurationsList;
