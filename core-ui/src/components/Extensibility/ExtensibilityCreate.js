import React, { useMemo, useEffect, useState } from 'react';
import { createStore } from '@ui-schema/ui-schema';
import { createOrderedMap } from '@ui-schema/ui-schema/Utils/createMap';
import Immutable from 'immutable';
import pluralize from 'pluralize';
import { useTranslation } from 'react-i18next';

import { ResourceForm } from 'shared/ResourceForm';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { useNotification } from 'shared/contexts/NotificationContext';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { useGetSchema } from 'hooks/useGetSchema';
import { prettifyKind } from 'shared/utils/helpers';

import { ResourceSchema } from './ResourceSchema';
import { usePreparePresets, createTemplate, getDefaultPreset } from './helpers';
import { VarStoreContextProvider } from './contexts/VarStore';
import { prepareSchemaRules } from './helpers/prepareSchemaRules';
import { useVariables } from './hooks/useVariables';

export function ExtensibilityCreateCore({
  formElementRef,
  setCustomValid,
  resourceType,
  resourceUrl,
  resource: initialResource,
  resourceSchema: createResource,
  toggleFormFn,
  resourceName,
}) {
  const { prepareVars, resetVars, readVars } = useVariables();
  const { namespaceId: namespace } = useMicrofrontendContext();
  const notification = useNotification();
  const { t } = useTranslation();
  const general = createResource?.general;
  const api = general?.resource || {};

  const emptyTemplate = createTemplate(api, namespace, general?.scope);
  const defaultPreset = getDefaultPreset(
    createResource?.presets,
    emptyTemplate,
  );

  const [resource, setResource] = useState(
    initialResource || defaultPreset?.value || emptyTemplate,
  );

  const presets = usePreparePresets(emptyTemplate, createResource?.presets);

  const [store, setStore] = useState(() =>
    createStore(createOrderedMap(resource)),
  );

  const updateResource = res => {
    resetVars();
    readVars(res);
    const newStore = Immutable.fromJS(res);
    setStore(prevStore => prevStore.set('values', newStore));
  };

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

    prepareVars(fullSchemaRules);
    readVars(resource);

    return {
      simpleRules: prepareSchemaRules(
        fullSchemaRules.filter(item => item.simple ?? false),
      ),
      advancedRules: prepareSchemaRules(
        fullSchemaRules.filter(item => item.advanced ?? true),
      ),
    };
  }, [createResource]); // eslint-disable-line react-hooks/exhaustive-deps

  // waiting for schema from OpenAPI to be computed
  if (loading) return <Spinner />;

  return (
    <ResourceForm
      pluralKind={resourceType}
      singularName={pluralize(resourceName || prettifyKind(resource.kind), 1)}
      resource={resource}
      setResource={updateResource}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml={!schema}
      presets={!initialResource && presets}
      initialResource={initialResource}
      afterCreatedFn={afterCreatedFn}
    >
      <ResourceSchema
        simple
        key={api.version}
        schema={errorOpenApi ? {} : schema}
        schemaRules={simpleRules}
        resource={resource}
        store={store}
        setStore={setStore}
        onSubmit={() => {}}
        path={general?.urlPath || ''}
      />
      <ResourceSchema
        advanced
        key={api.version}
        schema={errorOpenApi ? {} : schema}
        schemaRules={advancedRules}
        resource={resource}
        store={store}
        setStore={setStore}
        path={general?.urlPath || ''}
      />
    </ResourceForm>
  );
}

export function ExtensibilityCreate(props) {
  return (
    <VarStoreContextProvider>
      <ExtensibilityCreateCore {...props} />
    </VarStoreContextProvider>
  );
}

ExtensibilityCreate.allowEdit = true;
