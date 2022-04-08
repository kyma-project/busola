import React from 'react';

import { AddonsConfigurationCreate } from './AddonsConfigurationCreate';
import { GenericAddonsConfigurationList } from './GenericAddonsConfigurationList';

export function AddonsConfigurationsList(props) {
  return (
    <GenericAddonsConfigurationList
      descriptionKey={'addons.description'}
      documentationLink={
        'https://kyma-project-old.netlify.app/docs/components/helm-broker#custom-resource-addons-configuration'
      }
      createResourceForm={AddonsConfigurationCreate}
      {...props}
    />
  );
}

export default AddonsConfigurationsList;
