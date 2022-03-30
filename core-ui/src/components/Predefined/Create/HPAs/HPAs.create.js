import React, { useState } from 'react';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm';
import { createHPATemplate } from './templates';

function HorizontalPodAutoscalersCreate({
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
HorizontalPodAutoscalersCreate.resourceGraphConfig = (t, context) => ({
  networkFlowKind: true,
  networkFlowLevel: -1,
  relations: [
    {
      kind: 'Deployment',
    },
  ],
});
export { HorizontalPodAutoscalersCreate };
