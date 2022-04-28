import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { ResourceForm } from 'shared/ResourceForm';

import { createPodTemplate } from './templates';

export function PodCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceUrl,
  ...props
}) {
  const { namespaceId } = useMicrofrontendContext();
  const [pod, setPod] = useState(createPodTemplate(namespaceId));
  const { t } = useTranslation();

  return (
    <ResourceForm
      {...props}
      pluralKind="pods"
      singularName={t('pods.name_singular')}
      resource={pod}
      setResource={setPod}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml
    />
  );
}
