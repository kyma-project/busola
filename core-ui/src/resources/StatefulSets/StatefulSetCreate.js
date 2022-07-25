import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { ResourceForm } from 'shared/ResourceForm';

import { createStatefulSetTemplate } from './templates';

export function StatefulSetCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceUrl,
  ...props
}) {
  const { namespaceId } = useMicrofrontendContext();
  const [statefulSet, setStatefulSet] = useState(
    createStatefulSetTemplate(namespaceId),
  );
  const { t } = useTranslation();

  return (
    <ResourceForm
      {...props}
      pluralKind="statefulsets"
      singularName={t('stateful-sets.name_singular')}
      resource={statefulSet}
      setResource={setStatefulSet}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml
    />
  );
}
