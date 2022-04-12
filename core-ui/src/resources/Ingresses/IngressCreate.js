import React, { useState } from 'react';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm';
import { createIngressTemplate } from './templates';

export function IngressCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceUrl,
}) {
  const { namespaceId } = useMicrofrontendContext();
  const [ingress, setIngress] = useState(createIngressTemplate(namespaceId));
  const { t } = useTranslation();

  return (
    <ResourceForm
      pluralKind="ingresses"
      singularName={t('ingresses.name_singular')}
      resource={ingress}
      setResource={setIngress}
      onlyYaml
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
    />
  );
}
