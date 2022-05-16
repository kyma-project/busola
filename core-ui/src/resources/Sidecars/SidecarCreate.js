import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ResourceForm } from 'shared/ResourceForm';

import { createSidecarTemplate } from './templates';

export function SidecarCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceUrl,
  namespace,
  ...props
}) {
  const [sidecar, setSidecar] = useState(createSidecarTemplate(namespace));
  const { t } = useTranslation();

  return (
    <ResourceForm
      {...props}
      pluralKind="sidecars"
      singularName={t('sidecars.name_singular')}
      resource={sidecar}
      setResource={setSidecar}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml
    />
  );
}
