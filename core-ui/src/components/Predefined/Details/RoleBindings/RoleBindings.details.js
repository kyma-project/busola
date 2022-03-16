import React from 'react';
import { useTranslation } from 'react-i18next';

import { RoleSubjects } from './RoleSubjects.js';
import { RoleRef } from './RoleRef';

import './RoleBindingsDetails.scss';

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

export const RoleBindingsDetails = GenericRoleBindingDetails;
export const ClusterRoleBindingsDetails = GenericRoleBindingDetails;
