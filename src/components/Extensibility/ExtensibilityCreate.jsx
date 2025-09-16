import {
  useCallback,
  useMemo,
  useState,
  useContext,
  useEffect,
  useRef,
} from 'react';
import { fromJS } from 'immutable';
import pluralize from 'pluralize';
import { useTranslation } from 'react-i18next';
import jp from 'jsonpath';

import { ResourceForm } from 'shared/ResourceForm';
import { useNotification } from 'shared/contexts/NotificationContext';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { useGetSchema } from 'hooks/useGetSchema';
import { prettifyKind } from 'shared/utils/helpers';
import { ModeSelector } from 'shared/ResourceForm/components/ModeSelector';

import { ResourceSchema } from './ResourceSchema';
import { usePreparePresets, createTemplate, getDefaultPreset } from './helpers';
import { DataSourcesContextProvider } from './contexts/DataSources';
import { VarStoreContextProvider } from './contexts/VarStore';
import { prepareSchemaRules } from './helpers/prepareSchemaRules';
import {
  getResourceObjFromUIStore,
  getUIStoreFromResourceObj,
} from './helpers/immutableConverter';
import { useVariables } from './hooks/useVariables';
import { prepareRules } from './helpers/prepareRules';
import { cloneDeep, merge } from 'lodash';

import { TriggerContext, TriggerContextProvider } from './contexts/Trigger';
import { useAtomValue } from 'jotai';
import { activeNamespaceIdAtom } from 'state/activeNamespaceIdAtom';
import { useGetCRbyPath } from './useGetCRbyPath';
import { TranslationBundleContext } from './helpers';
import { columnLayoutAtom } from 'state/columnLayoutAtom';

export function ExtensibilityCreateCore({
  formElementRef,
  setCustomValid,
  resourceType,
  resourceUrl,
  resource: initialExtensibilityResource,
  resourceSchema: createResource,
  resourceName,
  editMode = false,
  ...props
}) {
  const { prepareVars, readVars } = useVariables();
  const namespace = useAtomValue(activeNamespaceIdAtom);
  const layoutState = useAtomValue(columnLayoutAtom);
  const notification = useNotification();
  const { t } = useTranslation();
  const general = createResource?.general;
  const api = useMemo(() => general?.resource || {}, [general?.resource]);
  const triggers = useContext(TriggerContext);

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
      initialExtensibilityResource || defaultPreset?.value || emptyTemplate,
    ),
  );

  const [initialResource, setInitialResource] = useState(
    initialExtensibilityResource,
  );
  const hasSetInitialResource = useRef(false);

  useEffect(() => {
    if (layoutState?.showEdit?.resource) return;

    setStore(
      getUIStoreFromResourceObj(
        initialExtensibilityResource || defaultPreset?.value || emptyTemplate,
      ),
    );
    setInitialResource(initialExtensibilityResource);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialExtensibilityResource, layoutState?.showEdit?.resource]);

  const presets = usePreparePresets(createResource?.presets, emptyTemplate);
  const resource = useMemo(() => getResourceObjFromUIStore(store), [store]);

  useEffect(() => {
    if (
      !initialResource &&
      !initialExtensibilityResource &&
      !hasSetInitialResource.current &&
      resource
    ) {
      const excludedResource = cloneDeep(resource);
      delete excludedResource.status;
      delete excludedResource.metadata;
      setInitialResource(excludedResource);
      hasSetInitialResource.current = true;
    }
  }, [initialExtensibilityResource, initialResource, resource]);

  const isEdit = useMemo(
    () =>
      !!initialResource?.metadata?.name && !layoutState?.showCreate?.resource,
    [initialResource, layoutState?.showCreate?.resource],
  );

  const updateStore = (res) => {
    readVars(res);
    const newStore = fromJS(res);
    setStore((prevStore) => prevStore.set('values', newStore));
  };

  const afterCreatedFn = async (defaultAfterCreatedFn) => {
    if (createResource?.details) {
      defaultAfterCreatedFn();
    } else {
      notification.notifySuccess({
        content: t(
          isEdit
            ? 'common.create-form.messages.patch-success'
            : 'common.create-form.messages.create-success',
          {
            resourceType: resourceName,
          },
        ),
      });
    }
  };

  const {
    schema,
    error: errorOpenApi,
    loading: loadingOpenAPISchema,
  } = useGetSchema({
    resource: api,
    additionalId: 'Create',
  });

  const formRules = useMemo(() => {
    const fullSchemaRules = prepareRules(
      createResource?.form ?? [],
      editMode,
      t,
    );

    prepareVars(fullSchemaRules);
    readVars(resource);
    setTimeout(() => triggers.trigger('init', []));

    return prepareSchemaRules(fullSchemaRules);
  }, [createResource]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNameChange = useCallback(
    (resourceName) => {
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
      {...props}
      pluralKind={resourceType}
      singularName={pluralize(resourceName || prettifyKind(resource.kind), 1)}
      resource={resource}
      setResource={(v) => setStore(getUIStoreFromResourceObj(v))}
      onPresetSelected={(presetValue) => {
        const updatedResource = merge(
          {},
          getResourceObjFromUIStore(store),
          presetValue,
        );
        setStore(getUIStoreFromResourceObj(updatedResource));
        readVars(updatedResource);
        triggers.trigger('init', []);
      }}
      onReset={() => {
        readVars(getResourceObjFromUIStore(store));
        triggers.trigger('init', []);
      }}
      onModeChange={(oldMode, newMode) => {
        if (newMode === ModeSelector.MODE_YAML) {
          triggers.disable();
        } else if (oldMode === ModeSelector.MODE_YAML) {
          readVars(resource).then(() => {
            setTimeout(() => triggers.enable());
          });
        }
      }}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml={!schema}
      presets={!isEdit && presets}
      initialResource={initialResource}
      updateInitialResource={setInitialResource}
      afterCreatedFn={afterCreatedFn}
      handleNameChange={handleNameChange}
      urlPath={general?.urlPath}
      disableDefaultFields
    >
      <ResourceSchema
        key={api.version}
        schema={errorOpenApi ? {} : schema}
        schemaRules={formRules}
        resource={resource}
        store={store}
        setStore={setStore}
        path={general?.urlPath || ''}
        editMode={editMode}
      />
    </ResourceForm>
  );
}

export default function ExtensibilityCreate(props) {
  const resMetaData = useGetCRbyPath();
  const { urlPath, defaultPlaceholder } = resMetaData?.general || {};

  return (
    <TranslationBundleContext.Provider
      value={{
        translationBundle: urlPath || 'extensibility',
        defaultResourcePlaceholder: defaultPlaceholder,
      }}
    >
      <DataSourcesContextProvider
        dataSources={props.resourceSchema?.dataSources || {}}
      >
        <TriggerContextProvider>
          <VarStoreContextProvider>
            <ExtensibilityCreateCore {...props} />
          </VarStoreContextProvider>
        </TriggerContextProvider>
      </DataSourcesContextProvider>
    </TranslationBundleContext.Provider>
  );
}
