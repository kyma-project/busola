import React from 'react';

import { Rules } from 'resources/Roles/Rules';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';

import { ClusterRoleCreate } from './ClusterRoleCreate';
import { Description } from 'shared/components/Description/Description';
import {
  clusterRoleDocsURL,
  clusterRoleI18nDescriptionKey,
} from 'resources/ClusterRoles/index';

const ClusterRolesDetails = props => {
  return (
    <ResourceDetails
      {...props}
      customComponents={[Rules]}
      createResourceForm={ClusterRoleCreate}
      description={
        <Description
          i18nKey={clusterRoleI18nDescriptionKey}
          url={clusterRoleDocsURL}
        />
      }
    />
  );
};

export default ClusterRolesDetails;
