import React from 'react';

import { GenericRoleBindingList } from 'resources/RoleBindings/GenericRoleBindingList';

import { ClusterRoleBindingCreate } from './ClusterRoleBindingCreate';
import {
  description,
  descriptionKey,
} from 'resources/ClusterRoleBindings/ClusterRoleBindingDescription';

export function ClusterRoleBindingList(props) {
  return (
    <GenericRoleBindingList
      description={description}
      descriptionKey={descriptionKey}
      {...props}
      createResourceForm={ClusterRoleBindingCreate}
    />
  );
}

export default ClusterRoleBindingList;
