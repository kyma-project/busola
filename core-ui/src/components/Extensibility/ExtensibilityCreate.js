import React, { useCallback, useMemo, useState } from 'react';
import Immutable from 'immutable';
import pluralize from 'pluralize';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';

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
import {
  getResourceObjFromUIStore,
  getUIStoreFromResourceObj,
} from './helpers/immutableConverter';
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
  const api = useMemo(() => general?.resource || {}, [general?.resource]);

  const emptyTemplate = useMemo(
    () => createTemplate(api, namespace, general?.scope),
    [api, namespace, general?.scope],
  );
  const defaultPreset = useMemo(
    () => getDefaultPreset(createResource?.presets, emptyTemplate),
    [createResource?.presets, emptyTemplate],
  );

  const [store, setStore] = useState(
    getUIStoreFromResourceObj(
      initialResource || defaultPreset?.value || emptyTemplate,
    ),
  );

  const presets = usePreparePresets(emptyTemplate, createResource?.presets);

  const resource = useMemo(() => getResourceObjFromUIStore(store), [store]);

  const updateStore = res => {
    resetVars();
    readVars(res);
    const newStore = Immutable.fromJS(res);
    setStore(prevStore => prevStore.set('values', newStore));
  };

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

  const {
    schema,
    error: errorOpenApi,
    loading: loadingOpenAPISchema,
  } = useGetSchema({
    resource: api,
  });

  const prepareRules = schemaRules => {
    const PREDEFINED_PATHS = [
      'metadata.name',
      'metadata.labels',
      'metadata.annotations',
    ];

    const defaultNameField = {
      path: 'metadata.name',
      simple: true,
      required: true,
      inputInfo: t('common.tooltips.k8s-name-input'),
    };
    const defaultLabelsField = {
      path: 'metadata.labels',
      widget: 'KeyValuePair',
      defaultOpen: false,
    };
    const defaultAnnotationsField = {
      path: 'metadata.annotations',
      widget: 'KeyValuePair',
      defaultOpen: false,
    };

    const nameField =
      schemaRules.find(r => r.path === 'metadata.name') || defaultNameField;
    const labelsField =
      schemaRules.find(r => r.path === 'metadata.labels') || defaultLabelsField;
    const annotationsField =
      schemaRules.find(r => r.path === 'metadata.annotations') ||
      defaultAnnotationsField;

    return [
      nameField,
      labelsField,
      annotationsField,
      ...schemaRules.filter(r => !PREDEFINED_PATHS.includes(r.path)),
    ];
  };

  const { simpleRules, advancedRules } = useMemo(() => {
    const fullSchemaRules = prepareRules(createResource?.form ?? []);

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

  const handleNameChange = useCallback(
    resourceName => {
      jp.value(resource, '$.metadata.name', resourceName);
      jp.value(
        resource,
        "$.metadata.labels['app.kubernetes.io/name']",
        resourceName,
      );
      updateStore(resource);
    },
    [resource], // eslint-disable-line react-hooks/exhaustive-deps,
  );

  if (loadingOpenAPISchema) return <Spinner />;

  return (
    <ResourceForm
      pluralKind={resourceType}
      singularName={pluralize(resourceName || prettifyKind(resource.kind), 1)}
      resource={resource}
      setResource={updateStore}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml={!schema}
      presets={!initialResource && presets}
      initialResource={initialResource}
      afterCreatedFn={afterCreatedFn}
      handleNameChange={handleNameChange}
      disableDefaultFields
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
