import React, { useEffect, useState } from 'react';
import { createStore } from '@ui-schema/ui-schema';
import { createOrderedMap } from '@ui-schema/ui-schema/Utils/createMap';
import Immutable from 'immutable';

import { ResourceForm } from 'shared/ResourceForm';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { useGetTranslation, createTemplate } from './helpers';

import { ResourceSchema } from './ResourceSchema';
import { useNotification } from 'shared/contexts/NotificationContext';
import { useTranslation } from 'react-i18next';
import { prettifyKind } from 'shared/utils/helpers';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { useGetSchema } from 'hooks/useGetSchema';

export const ExtensibilityCreate = ({ resourceSchema, ...props }) => {
  const { version, kind, group } = resourceSchema.resource;
  const openapiSchemaId = `${group}/${version}/${kind}`;

  const {
    schema: schemaFromOpenApi,
    error: errorOpenApi,
    loading,
  } = useGetSchema({
    schemaId: openapiSchemaId,
    skip: !!resourceSchema.schema,
  });

  // resource has schema hardcoded in the ConfigMap or no schema at all
  if (resourceSchema.schema || errorOpenApi) {
    return (
      <ExtensibilityCreateComponent
        {...props}
        resourceSchema={resourceSchema}
      />
    );
  }
  // waiting for schema from OpenAPI to be computed
  if (loading) return <Spinner />;

  // resource with the schema added from schemaFromOpenApi
  return (
    <ExtensibilityCreateComponent
      {...props}
      resourceSchema={{ ...resourceSchema, schema: schemaFromOpenApi }}
    />
  );
};

function ExtensibilityCreateComponent({
  formElementRef,
  setCustomValid,
  resourceType,
  resourceUrl,
  resource: initialResource,
  resourceSchema: createResource,
  toggleFormFn,
  resourceName,
}) {
  const { namespaceId: namespace } = useMicrofrontendContext();
  const notification = useNotification();
  const { t } = useTranslation();
  const { t: tExt, exists } = useGetTranslation();
  const api = createResource?.resource || {};
  const schema = createResource?.schema;

  const [resource, setResource] = useState(
    initialResource ||
      createResource?.template ||
      createTemplate(api, namespace, createResource?.resource?.scope),
  );

  const [store, setStore] = useState(() =>
    createStore(createOrderedMap(resource)),
  );

  const updateResource = res =>
    setStore(prevStore => prevStore.set('values', Immutable.fromJS(res)));

  //TODO filter schema based on form configuration

  useEffect(() => {
    setResource(store.valuesToJS());
  }, [store.values]); // eslint-disable-line react-hooks/exhaustive-deps

  const afterCreatedFn = async defaultAfterCreatedFn => {
    if (createResource?.details) {
      defaultAfterCreatedFn();
    } else {
      notification.notifySuccess({
        content: t(
          initialResource
            ? 'common.create-form.messages.patch-success'
            : 'common.create-form.messages.create-success',
          {
            resourceType: resourceName,
          },
        ),
      });
    }
    toggleFormFn(false);
  };

  return (
    <ResourceForm
      pluralKind={resourceType}
      singularName={
        exists('name')
          ? tExt('name')
          : prettifyKind(createResource.resource?.kind || '')
      }
      resource={resource}
      setResource={updateResource}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml={!schema}
      initialResource={initialResource}
      afterCreatedFn={afterCreatedFn}
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
        path={createResource?.resource?.path || ''}
      />
      <ResourceSchema
        advanced
        key={api.version}
        schema={schema || {}}
        schemaRules={createResource?.form}
        resource={resource}
        store={store}
        setStore={setStore}
        path={createResource?.resource?.path || ''}
      />
    </ResourceForm>
  );
}

ExtensibilityCreate.allowEdit = true;
