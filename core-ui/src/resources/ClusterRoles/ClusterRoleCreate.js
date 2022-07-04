import React from 'react';
import { useTranslation } from 'react-i18next';

import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { GenericRoleCreate } from 'resources/Roles/GenericRoleCreate';

import { createClusterRoleTemplate, createClusterRolePresets } from './helpers';

export function ClusterRoleCreate(props) {
  const { t } = useTranslation();
  const { groupVersions } = useMicrofrontendContext();
  return (
    <GenericRoleCreate
      {...props}
      pluralKind="clusterroles"
      singularName={t('cluster-roles.name_singular')}
      createTemplate={createClusterRoleTemplate}
      presets={createClusterRolePresets(t, groupVersions)}
    />
  );
}
ClusterRoleCreate.allowEdit = true;
ClusterRoleCreate.allowClone = true;
