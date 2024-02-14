import React from 'react';
import { useTranslation } from 'react-i18next';

import { RoleSubjects } from './RoleSubjects.js';
import { RoleRef } from './RoleRef';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { description } from './RoleBindingDescription';

export function GenericRoleBindingDetails({ DefaultRenderer, ...otherParams }) {
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
      description={description}
      customComponents={[RoleSubjects]}
    />
  );
}
