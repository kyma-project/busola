import React from 'react';

import { RoleBindingCreate } from './RoleBindingCreate';
import { GenericRoleBindingList } from './GenericRoleBindingList';

export function RoleBindingList(props) {
  return (
    <GenericRoleBindingList
      {...props}
      descriptionKey={'role-bindings.description'}
      createResourceForm={RoleBindingCreate}
    />
  );
}
export default RoleBindingList;
