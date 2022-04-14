import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm';
import { createCustomResourceDefinitionsTemplate } from './templates';

function CustomResourceDefinitionsCreate({
  namespace,
  formElementRef,
  onChange,
  setCustomValid,
  resourceUrl,
}) {
  const { t } = useTranslation();
  const [customResourceDefinitions, setCustomResourceDefinitions] = useState(
    createCustomResourceDefinitionsTemplate(namespace),
  );

  return (
    <ResourceForm
      pluralKind="customresourcedefinitions"
      singularName={t('custom-resource-definitions.name_singular')}
      resource={customResourceDefinitions}
      setResource={setCustomResourceDefinitions}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml
    />
  );
}

export { CustomResourceDefinitionsCreate };
