import React from 'react';
import * as jp from 'jsonpath';

import { ResourceForm } from 'shared/ResourceForm';
import { K8sNameField } from 'shared/ResourceForm/fields';

export function NameRenderer({ storeKeys, resource, setResource }) {
  const propertyPath = `$.${storeKeys.toJS().join('.')}`;
  const handleNameChange = name => {
    jp.value(resource, '$.metadata.name', name);
    jp.value(resource, "$.metadata.labels['app.kubernetes.io/name']", name);

    setResource({ ...resource });
  };
  return (
    <ResourceForm.Wrapper resource={resource} setResource={setResource}>
      <K8sNameField
        propertyPath={propertyPath}
        kind={resource.kind}
        setValue={handleNameChange}
        validate={value => !!value}
      />
    </ResourceForm.Wrapper>
  );
}
