import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Wizard } from 'fundamental-react';
import { mapValues } from 'lodash'; // XXX temporary
import jsyaml from 'js-yaml'; // XXX temporary
import { useTranslation } from 'react-i18next';
import {
  UIMetaProvider,
  UIStoreProvider,
  createOrderedMap,
  injectPluginStack,
  storeUpdater,
} from '@ui-schema/ui-schema';

import { useResourceSchemas } from 'hooks/useGetSchema';
import { useUploadResources } from 'resources/Namespaces/YamlUpload/useUploadResources';

import widgets from './components-form';
import { DataSourcesContextProvider } from './contexts/DataSources';
import { VarStoreContextProvider } from './contexts/VarStore';
import { TriggerContext, TriggerContextProvider } from './contexts/Trigger';
import {
  getResourceObjFromUIStore,
  getUIStoreFromResourceObj,
} from './helpers/immutableConverter';
import { prepareSchemaRules } from './helpers/prepareSchemaRules';
import { createTemplate } from './helpers';
import { useVariables } from './hooks/useVariables';
import { prepareRules } from './helpers/prepareRules';

// TODO common container
function FormContainer({ children }) {
  return (
    <div className="form-container" container="true">
      {children}
    </div>
  );
}
const FormStack = injectPluginStack(FormContainer);

export function ExtensibilityWizardCore({
  formElementRef,
  setCustomValid,
  resourceType,
  resourceUrl,
  resource: initialResource,
  resourceSchema,
  toggleFormFn,
  resourceName,
  onCancel,
  editMode = false,
  ...props
}) {
  const { prepareVars, setVar } = useVariables();
  const { t } = useTranslation();
  const triggers = useContext(TriggerContext);

  const [store, setStore] = useState(() =>
    mapValues(resourceSchema.general.resources, res =>
      getUIStoreFromResourceObj(createTemplate(res, 'default', res.scope)),
    ),
  );

  const { schemas } = useResourceSchemas(resourceSchema.general.resources);
  const schemaMaps = useMemo(
    () => mapValues(schemas, schema => createOrderedMap(schema)),
    [schemas],
  );
  const resources = useMemo(
    () => mapValues(store, val => getResourceObjFromUIStore(val)),
    [store],
  );
  const [resourcesWithStatuses, setResourcesWithStatuses] = useState([]);
  const onChange = (actions, resource) => {
    if (actions.scopes.includes('value')) {
      setStore(prevStore => {
        const newStore = storeUpdater(actions)(prevStore[resource]);
        return {
          ...prevStore,
          [resource]: newStore,
        };
      });
    }
  };

  useEffect(() => {
    const fullSchemaRules = prepareRules(
      resourceSchema.steps.flatMap(step => step.form) ?? [],
      editMode,
      t,
    );

    prepareVars(fullSchemaRules);
    setTimeout(() => triggers.trigger('init', []));
  }, [resourceSchema]); // eslint-disable-line react-hooks/exhaustive-deps

  const yaml = useMemo(() => {
    setResourcesWithStatuses(
      Object.values(resources).map(resource => ({ value: resource })),
    );
    return Object.values(resources)
      .map(resource => jsyaml.dump(resource))
      .join('\n---\n');
  }, [resources]);

  useEffect(() => {
    Object.entries(resources).forEach(([key, val]) => setVar(`$.${key}`, val));
  }, [resources, setVar]);

  const uploadResources = useUploadResources(
    resourcesWithStatuses,
    setResourcesWithStatuses,
    // setLastOperationState,
    () => {},
    // defaultNamespace,
    'default',
  );

  const onComplete = () => {
    uploadResources();
  };

  return (
    <UIMetaProvider widgets={widgets}>
      <Wizard
        navigationType="tabs"
        headerSize="md"
        contentSize="md"
        className="add-cluster-wizard"
        onCancel={onCancel}
        onComplete={onComplete}
      >
        {resourceSchema.steps.map(step => (
          <Wizard.Step title={step.name}>
            <UIStoreProvider
              store={store[step.resource]}
              showValidity={true}
              rootRule={prepareSchemaRules(step.form)}
              onChange={actions => onChange(actions, step.resource)}
            >
              <FormStack
                isRoot
                schema={schemaMaps[step.resource]}
                resource={resources[step.resource]}
              />
            </UIStoreProvider>
          </Wizard.Step>
        ))}
        <Wizard.Step title={'«summary»'}>
          <pre>{yaml}</pre>
        </Wizard.Step>
      </Wizard>
    </UIMetaProvider>
  );
}

export function ExtensibilityWizard(props) {
  const [structure, setStructure] = useState({});

  useEffect(() => {
    fetch('/wizard.yaml')
      .then(res => res.text())
      .then(rawdata => jsyaml.load(rawdata))
      .then(cmdata => mapValues(cmdata.data, item => jsyaml.load(item)))
      .then(setStructure);
  }, []);
  const size = useMemo(() => Object.keys(structure).length, [structure]);

  if (size) {
    return (
      <DataSourcesContextProvider dataSources={structure?.dataSources || {}}>
        <TriggerContextProvider>
          <VarStoreContextProvider>
            <ExtensibilityWizardCore {...props} resourceSchema={structure} />
          </VarStoreContextProvider>
        </TriggerContextProvider>
      </DataSourcesContextProvider>
    );
  } else {
    return 'loading';
  }
}
