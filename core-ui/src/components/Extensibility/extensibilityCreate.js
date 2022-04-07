import React, { useState } from 'react';
import { ResourceForm } from 'shared/ResourceForm';

export function ExtensibilityCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceType,
  resourceUrl,
}) {
  const [resource, setResource] = useState({});

  return (
    <ResourceForm
      pluralKind={resourceType}
      singularName={resourceType}
      resource={resource}
      setResource={setResource}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml
    />
  );
}
