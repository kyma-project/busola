import React from 'react';
import { useTranslation } from 'react-i18next';

export const RoleBindingsList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('role-bindings.headers.role-name'),
      value: binding => binding.roleRef.name,
    },
  ];

  return <DefaultRenderer customColumns={customColumns} {...otherParams} />;
};

export const ClusterRoleBindingsList = ({
  DefaultRenderer,
  ...otherParams
}) => {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('role-bindings.headers.role-name'),
      value: binding => binding.roleRef.name,
    },
  ];

  return <DefaultRenderer customColumns={customColumns} {...otherParams} />;
};
