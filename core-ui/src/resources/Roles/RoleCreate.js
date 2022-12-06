import React from 'react';
import { useTranslation } from 'react-i18next';

import { createRoleTemplate, createRolePresets } from './helpers';
import { GenericRoleCreate } from './GenericRoleCreate';
import { useRecoilValue } from 'recoil';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { groupVersionState } from 'state/discoverability/groupVersionsSelector';

export function RoleCreate(props) {
  const { t } = useTranslation();
  const groupVersions = useRecoilValue(groupVersionState) || [];
  const namespace = useRecoilValue(activeNamespaceIdState);

  return (
    <GenericRoleCreate
      {...props}
      pluralKind="roles"
      singularName={t('roles.name_singular')}
      createTemplate={() => createRoleTemplate(namespace)}
      presets={createRolePresets(namespace, t, groupVersions)}
    />
  );
}
RoleCreate.allowEdit = true;
RoleCreate.allowClone = true;
