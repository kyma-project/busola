import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { createStore } from '@ui-schema/ui-schema';
import { createOrderedMap } from '@ui-schema/ui-schema/Utils/createMap';
import Immutable from 'immutable';
import pluralize from 'pluralize';

import { ResourceForm } from 'shared/ResourceForm';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { createTemplate } from './helpers';

import { ResourceSchema } from './ResourceSchema';
import { useNotification } from 'shared/contexts/NotificationContext';
import { useTranslation } from 'react-i18next';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { useGetSchema } from 'hooks/useGetSchema';
import { prettifyKind } from 'shared/utils/helpers';
import { prepareSchemaRules } from './SchemaRulesInjector';
import { destinationRules } from './dr.js';

export function ExtensibilityCreate({
  formElementRef,
  setCustomValid,
  resourceType,
  resourceUrl,
  resource: initialResource,
  resourceSchema: createResource,
  toggleFormFn,
  resourceName,
}) {
  // THIS OVERWRITES ALL EXT FORMS
  createResource = destinationRules;

  const [varStore, setVarStore] = useState({});
  const { namespaceId: namespace } = useMicrofrontendContext();
  const notification = useNotification();
  const { t } = useTranslation();
  const general = createResource?.general;
  const api = general?.resource || {};

  const [resource, setResource] = useState(
    initialResource ||
      createResource?.template ||
      createTemplate(api, namespace, general?.scope),
  );

  const [store, setStore] = useState(() =>
    createStore(createOrderedMap(resource)),
  );

  const updateResource = useCallback(
    res =>
      setStore(prevStore => prevStore.set('values', Immutable.fromJS(res))),
    [setStore],
  );

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

  const { schema, error: errorOpenApi, loading } = useGetSchema({
    resource: api,
  });

  const { simpleRules, advancedRules } = useMemo(() => {
    const fullSchemaRules = [
      { path: 'metadata.name', simple: true },
      { path: 'metadata.labels' },
      { path: 'metadata.annotations' },
      ...(createResource?.form ?? []),
    ];

    return {
      simpleRules: prepareSchemaRules(
        fullSchemaRules.filter(item => item.simple ?? false),
      ),
      advancedRules: prepareSchemaRules(
        fullSchemaRules.filter(item => item.advanced ?? true),
      ),
    };
  }, [createResource]);

  // waiting for schema from OpenAPI to be computed
  if (loading) return <Spinner />;

  return (
    <ResourceForm
      pluralKind={resourceType}
      singularName={pluralize(resourceName || prettifyKind(resource.kind), 1)}
      resource={resource}
      updateResource={updateResource}
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
        schema={errorOpenApi ? {} : schema}
        schemaRules={simpleRules}
        resource={resource}
        updateResource={updateResource}
        store={store}
        setStore={setStore}
        onSubmit={() => {}}
        path={general?.urlPath || ''}
        varStore={varStore}
        setVarStore={setVarStore}
      />
      <ResourceSchema
        advanced
        key={api.version}
        schema={errorOpenApi ? {} : schema}
        updateResource={updateResource}
        schemaRules={advancedRules}
        resource={resource}
        store={store}
        setStore={setStore}
        path={general?.urlPath || ''}
        varStore={varStore}
        setVarStore={setVarStore}
      />
    </ResourceForm>
  );
}

ExtensibilityCreate.allowEdit = true;
