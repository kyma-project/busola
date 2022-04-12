import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { ResourceForm } from 'shared/ResourceForm';

import { createDaemonSetTemplate } from './templates';

export function DaemonSetCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceUrl,
}) {
  const { namespaceId } = useMicrofrontendContext();
  const [daemonSet, setDaemonSet] = useState(
    createDaemonSetTemplate(namespaceId),
  );
  const { t } = useTranslation();

  return (
    <ResourceForm
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
