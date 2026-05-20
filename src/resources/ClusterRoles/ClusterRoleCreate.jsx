import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { GenericRoleCreate } from 'resources/Roles/GenericRoleCreate';

import { createClusterRoleTemplate, createClusterRolePresets } from './helpers';
import { useAtomValue } from 'jotai';
import { groupVersionsAtomSync } from 'state/discoverability/groupVersionsAtom';

export default function ClusterRoleCreate(props) {
  const { t } = useTranslation();
  const groupVersions = useAtomValue(groupVersionsAtomSync);

  const createTemplate = useCallback(() => createClusterRoleTemplate(), []);

  const presets = useMemo(
    () => createClusterRolePresets(t, groupVersions),
    [t, groupVersions],
  );

  return (
    <GenericRoleCreate
      {...props}
      pluralKind="clusterroles"
      singularName={t('cluster-roles.name_singular')}
      createTemplate={createTemplate}
      presets={presets}
    />
  );
}
ClusterRoleCreate.allowClone = true;
