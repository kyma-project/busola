import React from 'react';

import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';

import { Rules } from './Rules';
import { RoleCreate } from './RoleCreate';
import { Description } from 'shared/components/Description/Description';
import { roleDocsURL, roleI18DescriptionKey } from 'resources/Roles/index';

export function RoleDetails(props) {
  return (
    <ResourceDetails
      {...props}
      customComponents={[Rules]}
      createResourceForm={RoleCreate}
      description={
        <Description i18nKey={roleI18DescriptionKey} url={roleDocsURL} />
      }
    />
  );
}

export default RoleDetails;
