import React from 'react';
import { useTranslation } from 'react-i18next';

import { GenericRoleCreate } from 'resources/Roles/GenericRoleCreate';

import { createClusterRoleTemplate, createClusterRolePresets } from './helpers';
import { useRecoilValue } from 'recoil';
import { groupVersionState } from 'state/discoverability/groupVersionsSelector';

export function ClusterRoleCreate(props) {
  const { t } = useTranslation();
  const groupVersions = useRecoilValue(groupVersionState);
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
