import {
  useState,
  useEffect,
  useMemo,
  useContext,
  Dispatch,
  SetStateAction,
  ComponentType,
} from 'react';
import { Wizard, WizardStep } from '@ui5/webcomponents-react';
import { mapValues } from 'lodash';
import jsyaml from 'js-yaml';
import jp from 'jsonpath';
import { useTranslation } from 'react-i18next';
import { UIMetaProvider } from '@ui-schema/react/UIMeta';
import { UIStoreProvider } from '@ui-schema/react/UIStore';
import { storeUpdater } from '@ui-schema/react/storeUpdater';
import { WidgetEngine as WidgetEngineBase } from '@ui-schema/react/WidgetEngine';
const WidgetEngine = WidgetEngineBase as ComponentType<any>;
import { createOrderedMap } from '@ui-schema/ui-schema/createMap';
import { UIStoreActions } from '@ui-schema/react';

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
import { createTemplate, useGetTranslation } from './helpers';
import { buildPathsFromObject } from 'shared/utils/helpers';
import { useVariables } from './hooks/useVariables';
import { prepareRules } from './helpers/prepareRules';

import './ExtensibilityWizard.scss';
import { useGetWizard } from './useGetWizard';
import { WizardButtons } from 'shared/components/WizardButtons/WizardButtons';

// TODO extract this as a helper
const isK8sResource = (resource: Record<string, any>) => {
  if (!resource) return true;
  return resource.apiVersion && resource.kind && resource.metadata;
};

type ExtensibilityWizardCoreProps = {
  resource?: Record<string, any>;
  resourceSchema?: Record<string, any>;
  onCancel: () => void;
  disableOnEdit?: boolean;
};

export function ExtensibilityWizardCore({
  resource: initialResource,
  resourceSchema,
  onCancel,
  disableOnEdit = false,
}: ExtensibilityWizardCoreProps) {
  const { prepareVars, setVar } = useVariables();
  const { t } = useTranslation();
  const { t: translator } = useGetTranslation();
  const triggers = useContext(TriggerContext);
  const settingYaml = (
    setYaml: Dispatch<SetStateAction<string>>,
    resources: Record<string, any>,
  ) => {
    setYaml(
      Object.values(resources)
        .map((resource) => jsyaml.dump(resource))
        .join('---\n'),
    );
  };
  const settingUploadState = (
    state: string,
    setUploadState: Dispatch<SetStateAction<string>>,
  ) => {
    setUploadState(state);
  };
  const settingError = (
    message: string | null,
    setError: Dispatch<SetStateAction<string | null>>,
  ) => {
    setError(message);
  };
  const settingResourcesWithStatuses = (
    resWithStatuses: Record<string, any>[],
    setResourcesWithStatuses: Dispatch<SetStateAction<any[]>>,
  ) => {
    setResourcesWithStatuses(resWithStatuses);
  };
  const [uploadState, setUploadState] = useState(OPERATION_STATE_INITIAL);
  const [error, setError] = useState<string | null>('');
  const [resourceInitial] = useState(
    JSON.parse(JSON.stringify(initialResource)),
  );
  const [selected, setSelected] = useState(1);

  const [store, setStore] = useState(() => {
    return mapValues(resourceSchema?.general?.resources, (res, key) => {
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
    resourceSchema?.general?.resources,
  );
  const schemaMaps: Record<string, any> = useMemo(
    () => mapValues(schemas, (schema) => createOrderedMap(schema)),
    [schemas],
  );
  const resources = useMemo(
    () => mapValues(store, (val) => getResourceObjFromUIStore(val)),
    [store],
  );
  const [resourcesWithStatuses, setResourcesWithStatuses] = useState<any[]>([]);

  const onChange = (
    actions: UIStoreActions | UIStoreActions[],
    resource: string,
  ) => {
    if (
      'scopes' in (actions as any) &&
      (actions as any).scopes.includes('value')
    ) {
      setStore((prevStore) => {
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
      resourceSchema?.steps.flatMap(
        (step: { form: Record<string, any>[] }) => step.form,
      ) ?? [],
      disableOnEdit,
      t,
    );

    prepareVars(fullSchemaRules);
    setTimeout(() => triggers.trigger('init', [] as any));
  }, [resourceSchema]); // eslint-disable-line react-hooks/exhaustive-deps

  const [yaml, setYaml] = useState('');
  useEffect(() => {
    settingYaml(setYaml, resources);
  }, [resources]);

  useEffect(() => {
    Object.entries(resources).forEach(([key, val]) => setVar(`$.${key}`, val));
  }, [resources, setVar]);

  useEffect(() => {
    // TODO common yaml parser with YamlUpload
    try {
      settingUploadState(OPERATION_STATE_INITIAL, setUploadState);

      const files = jsyaml.loadAll(yaml);
      if (files.some((file) => typeof file !== 'object')) {
        settingError(t('clusters.wizard.not-an-object'), setError);
      } else if (
        files.some((file) => !isK8sResource(file as Record<string, any>))
      ) {
        settingError(t('upload-yaml.messages.not-a-k8s-resource'), setError);
      } else {
        settingResourcesWithStatuses(
          files.map((resource) => {
            return { value: resource };
          }) as any,
          setResourcesWithStatuses,
        );

        settingError(null, setError);
      }
    } catch (err) {
      const message = (err as Error)?.message;
      const newlineIndex = message.indexOf('\n');
      settingError(
        newlineIndex === -1 ? message : message.substring(0, newlineIndex),
        setError,
      );
      settingResourcesWithStatuses([], setResourcesWithStatuses);
    }
  }, [yaml, t, resourceInitial]);

  const uploadResources = useUploadResources(
    resourcesWithStatuses,
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
    <UIMetaProvider binding={widgets as any} t={translator}>
      <Wizard contentLayout="SingleStep" className="extensibility-wizard">
        {resourceSchema?.steps?.map(
          (step: Record<string, any>, idx: number) => {
            selectedIndex = selectedIndex + 1;
            return (
              <WizardStep
                key={idx}
                titleText={step.name}
                selected={selected === selectedIndex}
              >
                <section className="resource-form">
                  <p>{step?.description}</p>
                  <UIStoreProvider
                    store={store[step.resource]}
                    showValidity={true}
                    rootRule={prepareSchemaRules(step.form)}
                    onChange={(actions) => onChange(actions, step.resource)}
                  >
                    <WidgetEngine
                      isRoot
                      schema={schemaMaps[step.resource]}
                      resource={resources[step.resource]}
                    />
                  </UIStoreProvider>
                </section>
                <WizardButtons
                  selectedStep={selected}
                  setSelectedStep={setSelected}
                  firstStep={selectedIndex === 1}
                  onCancel={onCancel}
                />
              </WizardStep>
            );
          },
        )}
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
            selectedStep={selected}
            setSelectedStep={setSelected}
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

type ExtensibilityWizardProps = {
  wizardName: string;
  singleRootResource?: Record<string, any>;
  onCancel: () => void;
  disableOnEdit?: boolean;
};

export function ExtensibilityWizard(props: ExtensibilityWizardProps) {
  const resMetaData = useGetWizard(props?.wizardName) as Record<string, any>;

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
