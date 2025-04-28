import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { createRoleTemplate, createRolePresets } from './helpers';
import { GenericRoleCreate } from './GenericRoleCreate';
import { useRecoilValue } from 'recoil';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { groupVersionState } from 'state/discoverability/groupVersionsSelector';

export default function RoleCreate(props) {
  const { t } = useTranslation();
  const groupVersions = useRecoilValue(groupVersionState);
  const namespace = useRecoilValue(activeNamespaceIdState);

  const createTemplate = useCallback(() => createRoleTemplate(namespace), [
    namespace,
  ]);

  const presets = useMemo(
    () => createRolePresets(namespace, t, groupVersions || []),
    [namespace, t, groupVersions],
  );

  return (
    <GenericRoleCreate
      {...props}
      pluralKind="roles"
      singularName={t('roles.name_singular')}
      createTemplate={createTemplate}
      presets={presets}
    />
  );
}
RoleCreate.allowClone = true;
