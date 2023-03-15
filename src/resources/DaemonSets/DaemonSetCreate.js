import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { ResourceForm } from 'shared/ResourceForm';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';

import { createDaemonSetTemplate } from './templates';

export function DaemonSetCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceUrl,
  ...props
}) {
  const namespaceId = useRecoilValue(activeNamespaceIdState);
  const [daemonSet, setDaemonSet] = useState(
    createDaemonSetTemplate(namespaceId),
  );
  const { t } = useTranslation();

  return (
    <ResourceForm
      {...props}
      pluralKind="daemonsets"
      singularName={t('daemon-sets.name_singular')}
      resource={daemonSet}
      setResource={setDaemonSet}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml
    />
  );
}
