import React from 'react';

import { GenericRoleList } from './GenericRoleList';
import { RoleCreate } from './RoleCreate';
import { Description } from 'shared/components/Description/Description';
import { roleDocsURL, roleI18DescriptionKey } from 'resources/Roles/index';

export function RoleList(props) {
  return (
    <GenericRoleList
      description={
        <Description i18nKey={roleI18DescriptionKey} url={roleDocsURL} />
      }
      descriptionKey={roleI18DescriptionKey}
      {...props}
      createResourceForm={RoleCreate}
    />
  );
}

export default RoleList;
