import React, { useState } from 'react';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm';
import { createServiceTemplate } from './templates';

export function ServiceCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceUrl,
  ...props
}) {
  const { namespaceId } = useMicrofrontendContext();
  const [service, setService] = useState(createServiceTemplate(namespaceId));
  const { t } = useTranslation();

  return (
    <ResourceForm
      {...props}
      pluralKind="services"
      singularName={t('services.name_singular')}
      resource={service}
      setResource={setService}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml
    />
  );
}
