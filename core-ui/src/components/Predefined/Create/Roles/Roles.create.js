import React from 'react';
import { useTranslation } from 'react-i18next';

import { createRoleTemplate, createClusterRoleTemplate } from './helpers';
import { useMicrofrontendContext } from 'react-shared';
import { GenericRoleCreate } from './GenericRoleCreate';

export function RolesCreate(props) {
  const { t } = useTranslation();
  const { namespaceId: namespace } = useMicrofrontendContext();
  return (
    <GenericRoleCreate
      {...props}
      pluralKind="roles"
      singularName={t('roles.name_singular')}
      createUrl={`/apis/rbac.authorization.k8s.io/v1/namespaces/${namespace}/roles/`}
      createTemplate={() => createRoleTemplate(namespace)}
    />
  );
}
export function ClusterRolesCreate(props) {
  const { t } = useTranslation();
  return (
    <GenericRoleCreate
      {...props}
      pluralKind="clusterroles"
      singularName={t('cluster-roles.name_singular')}
      createUrl={`/apis/rbac.authorization.k8s.io/v1/clusterroles/`}
      createTemplate={createClusterRoleTemplate}
    />
  );
}
