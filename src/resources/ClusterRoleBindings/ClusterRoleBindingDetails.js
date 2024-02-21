import React from 'react';

import { GenericRoleBindingDetails } from 'resources/RoleBindings/GenericRoleBindingDetails';

import { ClusterRoleBindingCreate } from './ClusterRoleBindingCreate';
import { Description } from 'shared/components/Description/Description';
import {
  clusterRoleBindingDocsURL,
  clusterRoleBindingI18nDescriptionKey,
} from 'resources/ClusterRoleBindings/index';

export function ClusterRoleBindingsDetails(props) {
  return (
    <GenericRoleBindingDetails
      {...props}
      description={
        <Description
          i18nKey={clusterRoleBindingI18nDescriptionKey}
          url={clusterRoleBindingDocsURL}
        />
      }
      createResourceForm={ClusterRoleBindingCreate}
    />
  );
}

export default ClusterRoleBindingsDetails;
