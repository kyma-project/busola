import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { ResourceForm } from 'shared/ResourceForm';

import { createHPATemplate } from './templates';

export function HorizontalPodAutoscalerCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceUrl,
}) {
  const { namespaceId } = useMicrofrontendContext();
  const [HPA, setHPA] = useState(createHPATemplate(namespaceId));
  const { t } = useTranslation();

  return (
    <ResourceForm
      pluralKind="HorizontalPodAutoscalers"
      singularName={t('hpas.name_singular')}
      resource={HPA}
      setResource={setHPA}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml
    />
  );
}
