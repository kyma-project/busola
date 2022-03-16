import React from 'react';
import { useTranslation } from 'react-i18next';

import { RoleSubjects } from './RoleSubjects.js';
import { RoleRef } from './RoleRef';

import './RoleBindingsDetails.scss';

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
