import React from 'react';
import { useTranslation } from 'react-i18next';

import { RoleSubjects } from './RoleSubjects.js';
import { RoleRef } from './RoleRef';

export function RoleBindingsDetails(props) {
  const { t } = useTranslation();
  return (
    <GenericRoleBindingDetails
      resourceTitle={t('role-bindings.title')}
      {...props}
    />
  );
}

export function ClusterRoleBindingsDetails(props) {
  const { t } = useTranslation();
  return (
    <GenericRoleBindingDetails
      resourceTitle={t('cluster-role-bindings.title')}
      {...props}
    />
  );
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
      {...otherParams}
      customColumns={customColumns}
      customComponents={[RoleSubjects]}
    />
  );
}
