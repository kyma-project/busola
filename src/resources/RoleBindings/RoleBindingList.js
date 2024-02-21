import React from 'react';

import { RoleBindingCreate } from './RoleBindingCreate';
import { GenericRoleBindingList } from './GenericRoleBindingList';
import { Description } from 'shared/components/Description/Description';
import {
  roleBindingDocsURL,
  roleBindingI18nDescriptionKey,
} from 'resources/RoleBindings/index';

export function RoleBindingList(props) {
  return (
    <GenericRoleBindingList
      description={
        <Description
          i18nKey={roleBindingI18nDescriptionKey}
          url={roleBindingDocsURL}
        />
      }
      descriptionKey={roleBindingI18nDescriptionKey}
      {...props}
      createResourceForm={RoleBindingCreate}
    />
  );
}

export default RoleBindingList;
