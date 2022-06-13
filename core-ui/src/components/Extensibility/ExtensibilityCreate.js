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
  resource: initialResource,
  resourceSchema: createResource,
}) {
  const { namespaceId: namespace } = useMicrofrontendContext();
  const api = createResource?.resource || {};

  const [resource, setResource] = useState(
    initialResource ||
      createResource?.template ||
      createTemplate(api, namespace, createResource?.navigation?.scope),
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
      initialResource={initialResource}
    >
      <ResourceSchema
        simple
        key={api.version}
        schema={schema || {}}
        schemaRules={createResource?.form}
        resource={resource}
        setResource={setResource}
        onSubmit={() => {}}
        path={createResource?.navigation?.path || ''}
      />
      <ResourceSchema
        advanced
        key={api.version}
        schema={schema || {}}
        schemaRules={createResource?.form}
        resource={resource}
        setResource={setResource}
        path={createResource?.navigation?.path || ''}
      />
    </ResourceForm>
  );
}

ExtensibilityCreate.allowEdit = true;
