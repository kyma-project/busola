import React from 'react';

import { AddonsConfigurationCreate } from './AddonsConfigurationCreate';
import { GenericAddonsConfigurationDetails } from './GenericAddonsConfigurationDetails';

export function AddonsConfigurationsDetails(props) {
  return (
    <GenericAddonsConfigurationDetails
      createResourceForm={AddonsConfigurationCreate}
      {...props}
    />
  );
}

export default AddonsConfigurationsDetails;
