import React from 'react';

import { GenericRoleBindingList } from 'resources/RoleBindings/GenericRoleBindingList';

import { ClusterRoleBindingCreate } from './ClusterRoleBindingCreate';
import { Description } from 'shared/components/Description/Description';
import {
  clusterRoleBindingDocsURL,
  clusterRoleBindingI18nDescriptionKey,
} from 'resources/ClusterRoleBindings/index';

export function ClusterRoleBindingList(props) {
  return (
    <GenericRoleBindingList
      description={
        <Description
          i18nKey={clusterRoleBindingI18nDescriptionKey}
          url={clusterRoleBindingDocsURL}
        />
      }
      descriptionKey={clusterRoleBindingI18nDescriptionKey}
      {...props}
      createResourceForm={ClusterRoleBindingCreate}
    />
  );
}

export default ClusterRoleBindingList;
