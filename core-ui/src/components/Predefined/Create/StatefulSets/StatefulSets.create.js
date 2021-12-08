import React, { useState } from 'react';
import { useMicrofrontendContext } from 'react-shared';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm';
import { createStatefulSetTemplate } from './templates';

function StatefulSetsCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceUrl,
}) {
  const { namespaceId } = useMicrofrontendContext();
  const [statefulSet, setStatefulSet] = useState(
    createStatefulSetTemplate(namespaceId),
  );
  const { t } = useTranslation();

  return (
    <ResourceForm
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
export { StatefulSetsCreate };
