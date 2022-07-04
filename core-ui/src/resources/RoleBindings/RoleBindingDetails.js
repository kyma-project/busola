import React from 'react';

import { RoleBindingCreate } from './RoleBindingCreate';
import { GenericRoleBindingDetails } from './GenericRoleBindingDetails';

export function RoleBindingsDetails(props) {
  return (
    <GenericRoleBindingDetails
      {...props}
      createResourceForm={RoleBindingCreate}
    />
  );
}

export default RoleBindingsDetails;
