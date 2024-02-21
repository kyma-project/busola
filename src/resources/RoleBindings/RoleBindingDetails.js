import React from 'react';

import { RoleBindingCreate } from './RoleBindingCreate';
import { GenericRoleBindingDetails } from './GenericRoleBindingDetails';
import { Description } from 'shared/components/Description/Description';
import {
  roleBindingDocsURL,
  roleBindingI18nDescriptionKey,
} from 'resources/RoleBindings/index';

export function RoleBindingsDetails(props) {
  return (
    <GenericRoleBindingDetails
      {...props}
      description={
        <Description
          i18nKey={roleBindingI18nDescriptionKey}
          url={roleBindingDocsURL}
        />
      }
      createResourceForm={RoleBindingCreate}
    />
  );
}

export default RoleBindingsDetails;
