import React from 'react';

import { GenericRoleList } from './GenericRoleList';
import { RoleCreate } from './RoleCreate';

export function RoleList(props) {
  return (
    <GenericRoleList
      descriptionKey={'roles.description'}
      {...props}
      createResourceForm={RoleCreate}
    />
  );
}

export default RoleList;
