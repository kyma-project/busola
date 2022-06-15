import React, { useEffect, useState } from 'react';
import { createStore } from '@ui-schema/ui-schema';
import { createOrderedMap } from '@ui-schema/ui-schema/Utils/createMap';
import Immutable from 'immutable';

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
      createTemplate(api, namespace, createResource?.navigation?.scope),
  );

  const [store, setStore] = useState(() =>
    createStore(createOrderedMap(resource)),
  );

  const updateResource = res =>
    setStore(prevStore => prevStore.set('values', Immutable.fromJS(res)));

  //TODO filter schema based on form configuration
  const schema = createResource?.schema;

  useEffect(() => {
    setResource(store.valuesToJS());
  }, [store.values]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ResourceForm
      pluralKind={resourceType}
      singularName={resourceType}
      resource={resource}
      setResource={updateResource}
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
        store={store}
        setStore={setStore}
        onSubmit={() => {}}
        path={createResource?.navigation?.path || ''}
      />
      <ResourceSchema
        advanced
        key={api.version}
        schema={schema || {}}
        schemaRules={createResource?.form}
        resource={resource}
        store={store}
        setStore={setStore}
        path={createResource?.navigation?.path || ''}
      />
    </ResourceForm>
  );
}
