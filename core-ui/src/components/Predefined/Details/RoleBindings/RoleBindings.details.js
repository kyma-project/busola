import React from 'react';
import { useTranslation } from 'react-i18next';

import { RoleSubjects } from './RoleSubjects.js';
import { RoleRef } from './RoleRef';

export function RoleBindingsDetails(props) {
  return <GenericRoleBindingDetails {...props} />;
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
    <DefaultRenderer
      resourceTitle={t('cluster-role-bindings.title')}
      {...otherParams}
      customColumns={customColumns}
      customComponents={[RoleSubjects]}
    />
  );
}
