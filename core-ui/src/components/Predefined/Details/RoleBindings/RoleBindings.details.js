import React from 'react';
import { useTranslation } from 'react-i18next';

import { RoleSubjects } from './RoleSubjects.js';
import { RoleRef } from './RoleRef';
import { ClusterRoleBindingsCreate } from '../../Create/RoleBindings/RoleBindings.create';
import { ResourceDetails } from 'react-shared';

function RoleBindingsDetails(props) {
  return (
    <GenericRoleBindingDetails
      {...props}
      createResourceForm={ClusterRoleBindingsCreate}
    />
  );
}

export function ClusterRoleBindingsDetails(props) {
  return <GenericRoleBindingDetails {...props} />;
}

function GenericRoleBindingDetails({ DefaultRenderer, ...otherParams }) {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('role-bindings.headers.role-ref'),
      value: resource => <RoleRef roleRef={resource.roleRef} />,
    },
  ];
  return (
    <ResourceDetails
      {...otherParams}
      customColumns={customColumns}
      customComponents={[RoleSubjects]}
    />
  );
}
export default RoleBindingsDetails;
