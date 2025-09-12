import React from 'react';

import RoleBindingCreate from './RoleBindingCreate';
import { GenericRoleBindingList } from './GenericRoleBindingList';
import {
  ResourceDescription,
  i18nDescriptionKey,
} from 'resources/RoleBindings';

export function RoleBindingList(props) {
  return (
    <GenericRoleBindingList
      description={ResourceDescription}
      descriptionKey={i18nDescriptionKey}
      {...props}
      createResourceForm={RoleBindingCreate}
    />
  );
}

export default RoleBindingList;
