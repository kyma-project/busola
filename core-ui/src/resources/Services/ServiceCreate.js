import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm';
import { createServiceTemplate } from './templates';
import { useRecoilValue } from 'recoil';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';

export function ServiceCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceUrl,
  ...props
}) {
  const namespaceId = useRecoilValue(activeNamespaceIdState);
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
