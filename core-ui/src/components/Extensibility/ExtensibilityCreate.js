import React, { useState } from 'react';

import { ResourceForm } from 'shared/ResourceForm';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';

import { createTemplate } from './helpers';
import { ResourceSchema } from './ResourceSchema';

export function ExtensibilityCreate({
  formElementRef,
  setCustomValid,
  resourceType,
  resourceUrl,
  resource: createResource,
}) {
  const { namespaceId: namespace } = useMicrofrontendContext();
  const api = createResource?.resource || {};

  const [resource, setResource] = useState(
    createResource?.template ||
      createTemplate(api, namespace, createResource?.resource?.scope),
  );
  //TODO filter schema based on form configuration
  const schema = createResource?.schema;

  return (
    <ResourceForm
      pluralKind={resourceType}
      singularName={resourceType}
      resource={resource}
      setResource={setResource}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml={!schema}
    >
      <ResourceSchema
        simple
        key={api.version}
        schema={schema || {}}
        schemaRules={createResource?.form}
        resource={resource}
        setResource={setResource}
        onSubmit={() => {}}
        path={createResource?.resource?.path || ''}
      />
      <ResourceSchema
        advanced
        key={api.version}
        schema={schema || {}}
        schemaRules={createResource?.form}
        resource={resource}
        setResource={setResource}
        path={createResource?.resource?.path || ''}
      />
    </ResourceForm>
  );
}
