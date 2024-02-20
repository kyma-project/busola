import React from 'react';

import { RoleBindingCreate } from './RoleBindingCreate';
import { GenericRoleBindingDetails } from './GenericRoleBindingDetails';
import { description } from 'resources/RoleBindings/RoleBindingDescription';

export function RoleBindingsDetails(props) {
  return (
    <GenericRoleBindingDetails
      {...props}
      description={description}
      createResourceForm={RoleBindingCreate}
    />
  );
}

export default RoleBindingsDetails;
