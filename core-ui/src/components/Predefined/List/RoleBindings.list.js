import React from 'react';
import LuigiClient from '@luigi-project/client';
import { useTranslation } from 'react-i18next';
import { Link } from 'fundamental-react';

const navigateToClusterRole = roleName =>
  LuigiClient.linkManager()
    .fromContext('cluster')
    .navigate(`/clusterroles/details/${roleName}`);

const navigateToRole = roleName =>
  LuigiClient.linkManager()
    .fromContext('namespace')
    .navigate(`/roles/details/${roleName}`);

export const RoleBindingsList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  const navigate = (roleName, kind) => {
    if (kind === 'ClusterRole') {
      navigateToClusterRole(roleName);
    } else {
      navigateToRole(roleName);
    }
  };

  const customColumns = [
    {
      header: t('role-bindings.headers.role-name'),
      value: binding => (
        <Link
          className="fd-link"
          onClick={() => navigate(binding.roleRef.name, binding.roleRef.kind)}
        >
          {binding.roleRef.name}
        </Link>
      ),
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
      value: binding => (
        <Link
          className="fd-link"
          onClick={() => navigateToClusterRole(binding.roleRef.name)}
        >
          {binding.roleRef.name}
        </Link>
      ),
    },
  ];

  return <DefaultRenderer customColumns={customColumns} {...otherParams} />;
};
