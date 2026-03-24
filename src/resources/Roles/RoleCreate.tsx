import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { createRoleTemplate, createRolePresets } from './helpers';
import { GenericRoleCreate } from './GenericRoleCreate';
import { useAtomValue } from 'jotai';
import { activeNamespaceIdAtom } from 'state/activeNamespaceIdAtom';
import { groupVersionsAtom } from 'state/discoverability/groupVersionsAtom';

interface RoleCreateProps {
  [key: string]: any;
}

export default function RoleCreate(props: RoleCreateProps) {
  const { t } = useTranslation();
  const groupVersions = useAtomValue(groupVersionsAtom);
  const namespace = useAtomValue(activeNamespaceIdAtom);

  const createTemplate = useCallback(
    () => createRoleTemplate(namespace),
    [namespace],
  );

  const presets = useMemo(
    () => createRolePresets(namespace, t, groupVersions || []),
    [namespace, t, groupVersions],
  );

  return (
    <GenericRoleCreate
      {...(props as any)}
      pluralKind="roles"
      singularName={t('roles.name_singular')}
      createTemplate={createTemplate}
      presets={presets}
    />
  );
}
RoleCreate.allowClone = true;
