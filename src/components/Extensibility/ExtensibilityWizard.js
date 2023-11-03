import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Wizard, WizardStep } from '@ui5/webcomponents-react';
import { mapValues } from 'lodash';
import jsyaml from 'js-yaml';
import * as jp from 'jsonpath';
import { useTranslation } from 'react-i18next';
import {
  UIMetaProvider,
  UIStoreProvider,
  createOrderedMap,
  injectPluginStack,
  storeUpdater,
} from '@ui-schema/ui-schema';

import { useGetResourceSchemas } from 'hooks/useGetSchema';
import { useUploadResources } from 'resources/Namespaces/YamlUpload/useUploadResources';
import { Editor } from 'shared/components/MonacoEditorESM/Editor';
import {
  OPERATION_STATE_INITIAL,
  OPERATION_STATE_SUCCEEDED,
} from 'resources/Namespaces/YamlUpload/YamlUploadDialog';
import { YamlResourcesList } from 'resources/Namespaces/YamlUpload/YamlResourcesList';
import { Spinner } from 'shared/components/Spinner/Spinner';

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
import { buildPathsFromObject } from 'shared/utils/helpers';
import { useVariables } from './hooks/useVariables';
import { prepareRules } from './helpers/prepareRules';

import './ExtensibilityWizard.scss';
import { useGetWizard } from './useGetWizard';
import { WizardButtons } from 'shared/components/WizardButtons/WizardButtons';

// TODO extract this as a helper
const isK8sResource = resource => {
  if (!resource) return true;
  return resource.apiVersion && resource.kind && resource.metadata;
};

// TODO common container
function FormContainer({ children }) {
  return <>{children}</>;
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
  disableOnEdit = false,
  ...props
}) {
  const { prepareVars, setVar } = useVariables();
  const { t } = useTranslation();
  const triggers = useContext(TriggerContext);
  const [uploadState, setUploadState] = useState(OPERATION_STATE_INITIAL);
  const [error, setError] = useState('');
  const [resourceInitial] = useState(
    JSON.parse(JSON.stringify(initialResource)),
  );
  const [selected, setSelected] = useState(1);

  const [store, setStore] = useState(() => {
    return mapValues(resourceSchema.general.resources, (res, key) => {
      if (initialResource && resourceSchema?.defaults?.[key]) {
        const path = buildPathsFromObject(resourceSchema?.defaults[key]);

        for (let i = 0; i < path.length; i++) {
          const value = jp.value(resourceSchema?.defaults[key], `$.${path[i]}`);
          jp.value(initialResource, `$.${path[i]}`, value);
        }
      }

      return getUIStoreFromResourceObj(
        initialResource || {
          ...createTemplate(res, 'default', res.scope),
          ...(resourceSchema?.defaults[key] ?? {}),
        },
      );
    });
  });

  const { schemas, loading: loadingSchemas } = useGetResourceSchemas(
    resourceSchema.general.resources,
  );
  const schemaMaps = useMemo(
    () => mapValues(schemas, schema => createOrderedMap(schema)),
    [schemas],
  );
  const resources = useMemo(
    () => mapValues(store, val => getResourceObjFromUIStore(val)),
    [store],
  );
  const [resourcesWithStatuses, setResourcesWithStatuses] = useState([]);
  const [initialUnchangedResources, setInitialUnchangedResources] = useState(
    resourcesWithStatuses,
  );

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
      disableOnEdit,
      t,
    );

    prepareVars(fullSchemaRules);
    setTimeout(() => triggers.trigger('init', []));
  }, [resourceSchema]); // eslint-disable-line react-hooks/exhaustive-deps

  const [yaml, setYaml] = useState('');
  useEffect(() => {
    setYaml(
      Object.values(resources)
        .map(resource => jsyaml.dump(resource))
        .join('---\n'),
    );
  }, [resources]);

  useEffect(() => {
    Object.entries(resources).forEach(([key, val]) => setVar(`$.${key}`, val));
  }, [resources, setVar]);

  useEffect(() => {
    // TODO common yaml parser with YamlUpload
    try {
      setUploadState(OPERATION_STATE_INITIAL);

      const files = jsyaml.loadAll(yaml);
      if (files.some(file => typeof file !== 'object')) {
        setError(t('clusters.wizard.not-an-object'));
      } else if (files.some(file => !isK8sResource(file))) {
        setError(t('upload-yaml.messages.not-a-k8s-resource'));
      } else {
        setResourcesWithStatuses(
          files.map(resource => {
            return { value: resource };
          }),
        );

        if (!initialUnchangedResources.length) {
          const temp = files.map(resource => {
            if (
              resource.metadata.name === resourceInitial.metadata.name &&
              resource.kind === resourceInitial.kind
            ) {
              const temp = { value: resourceInitial };
              return temp;
            } else return resource;
          });
          setInitialUnchangedResources(temp);
        }
        setError(null);
      }
    } catch ({ message }) {
      setError(message.substr(0, message.indexOf('\n')));
      setResourcesWithStatuses([]);
    }
  }, [yaml, t, initialUnchangedResources, resourceInitial]);

  const uploadResources = useUploadResources(
    resourcesWithStatuses,
    initialUnchangedResources,
    setResourcesWithStatuses,
    setUploadState,

    // defaultNamespace,
    'default',
  );

  const onComplete = () => {
    if (uploadState === OPERATION_STATE_SUCCEEDED) {
      onCancel();
    } else {
      uploadResources();
    }
  };

  if (loadingSchemas) return <Spinner />;

  let selectedIndex = 0;

  return (
    <UIMetaProvider widgets={widgets}>
      <Wizard contentLayout="SingleStep" className="extensibility-wizard">
        {resourceSchema.steps.map(step => {
          selectedIndex = selectedIndex + 1;
          return (
            <WizardStep
              titleText={step.name}
              selected={selected === selectedIndex}
            >
              <section className="resource-form">
                <p>{step?.description}</p>
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
              </section>
              <WizardButtons
                selected={selected}
                setSelected={setSelected}
                firstStep={selectedIndex === 1}
                onCancel={onCancel}
              />
            </WizardStep>
          );
        })}
        <WizardStep
          titleText={t('extensibility.wizard.summary')}
          selected={selected === selectedIndex + 1}
        >
          <div className="summary-content">
            <Editor
              autocompletionDisabled
              height="60vh"
              language="yaml"
              value={yaml || ''}
              onChange={setYaml}
              error={error}
            />
            <div>
              <YamlResourcesList resourcesData={resourcesWithStatuses} />
            </div>
          </div>
          <WizardButtons
            selected={selected}
            setSelected={setSelected}
            lastStep={true}
            customFinish={
              uploadState === OPERATION_STATE_SUCCEEDED
                ? t('common.buttons.close')
                : t('extensibility.wizard.upload')
            }
            onCancel={onCancel}
            onComplete={onComplete}
          />
        </WizardStep>
      </Wizard>
    </UIMetaProvider>
  );
}

export function ExtensibilityWizard(props) {
  const resMetaData = useGetWizard(props?.wizardName);

  const size = useMemo(() => Object.keys(resMetaData).length, [resMetaData]);

  if (size) {
    return (
      <DataSourcesContextProvider dataSources={resMetaData?.dataSources || {}}>
        <TriggerContextProvider>
          <VarStoreContextProvider>
            <ExtensibilityWizardCore
              {...props}
              resourceSchema={resMetaData}
              resource={props?.singleRootResource}
            />
          </VarStoreContextProvider>
        </TriggerContextProvider>
      </DataSourcesContextProvider>
    );
  } else {
    return 'loading';
  }
}
