import React, { useState } from 'react';
import { ResourceForm } from 'shared/ResourceForm';
import { createCustomResourceDefinitionsTemplate } from './templates';

function CustomResourceDefinitionsCreate({
  namespace,
  formElementRef,
  onChange,
  setCustomValid,
  resourceUrl,
}) {
  const [customResourceDefinitions, setCustomResourceDefinitions] = useState(
    createCustomResourceDefinitionsTemplate(namespace),
  );

  return (
    <ResourceForm
      pluralKind="customresourcedefinitions"
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
