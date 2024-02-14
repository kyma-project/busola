import React from 'react';

import { GenericRoleList } from './GenericRoleList';
import { RoleCreate } from './RoleCreate';
import { description, descriptionKey } from './RoleDescription';

export function RoleList(props) {
  return (
    <GenericRoleList
      description={description}
      descriptionKey={descriptionKey}
      {...props}
      createResourceForm={RoleCreate}
    />
  );
}

export default RoleList;
