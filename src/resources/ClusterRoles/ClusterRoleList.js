import React from 'react';
import { GenericRoleList } from 'resources/Roles/GenericRoleList';
import { ClusterRoleCreate } from './ClusterRoleCreate';
import { Description } from 'shared/components/Description/Description';
import {
  clusterRoleDocsURL,
  clusterRoleI18nDescriptionKey,
} from 'resources/ClusterRoles/index';

export function ClusterList(props) {
  return (
    <GenericRoleList
      description={
        <Description
          i18nKey={clusterRoleI18nDescriptionKey}
          url={clusterRoleDocsURL}
        />
      }
      descriptionKey={clusterRoleI18nDescriptionKey}
      {...props}
      createResourceForm={ClusterRoleCreate}
    />
  );
}

export default ClusterList;
