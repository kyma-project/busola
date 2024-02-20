import React from 'react';

import { RoleBindingCreate } from './RoleBindingCreate';
import { GenericRoleBindingList } from './GenericRoleBindingList';
import {
  description,
  descriptionKey,
} from 'resources/RoleBindings/RoleBindingDescription';

export function RoleBindingList(props) {
  return (
    <GenericRoleBindingList
      description={description}
      descriptionKey={descriptionKey}
      {...props}
      createResourceForm={RoleBindingCreate}
    />
  );
}

export default RoleBindingList;
