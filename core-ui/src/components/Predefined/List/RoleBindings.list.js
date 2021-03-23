import React from 'react';

export const RoleBindingsList = DefaultRenderer => ({ ...otherParams }) => {
  const customColumns = [
    {
      header: 'Role Name',
      value: binding => binding.roleRef.name,
    },
  ];

  return <DefaultRenderer customColumns={customColumns} {...otherParams} />;
};

export const ClusterRoleBindingsList = DefaultRenderer => ({
  ...otherParams
}) => {
  const customColumns = [
    {
      header: 'Role Name',
      value: binding => binding.roleRef.name,
    },
  ];

  return <DefaultRenderer customColumns={customColumns} {...otherParams} />;
};
