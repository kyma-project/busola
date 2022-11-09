import React, { useMemo, useState } from 'react';
import { Link } from 'shared/components/Link/Link';
import { Trans, useTranslation } from 'react-i18next';
import { createPatch } from 'rfc6902';
import { LayoutPanel, MessageStrip, Button } from 'fundamental-react';
import { useParams } from 'react-router-dom';
import { UIMetaProvider } from '@ui-schema/ui-schema/UIMeta';
import {
  UIStoreProvider,
  storeUpdater,
  createStore,
} from '@ui-schema/ui-schema';
import { injectPluginStack } from '@ui-schema/ui-schema/applyPluginStack';
import { createOrderedMap } from '@ui-schema/ui-schema/Utils/createMap';
import jsyaml from 'js-yaml';

import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';
import { useFeature } from 'shared/hooks/useFeature';
import { useUpdate } from 'shared/hooks/BackendAPI/useMutation';
import { useNotification } from 'shared/contexts/NotificationContext';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { ModalWithForm } from 'shared/components/ModalWithForm/ModalWithForm';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { limitedWidgets } from 'components/Extensibility/components-form';
import { getResourceObjFromUIStore } from 'components/Extensibility/helpers/immutableConverter';

import {
  formatCurrentVersion,
  getLatestVersion,
  getSupportedVersions,
  migrateToLatest,
  getMigrationFunctions,
} from '../../components/Extensibility/migration';

import { BusolaExtensionEdit } from './BusolaExtensionEdit';
import { SECTIONS } from './helpers';
import { EXTENSION_VERSION_LABEL } from './constants';

function FormContainer({ children }) {
  return (
    <div className="form-container" container="true">
      {children}
    </div>
  );
}
const FormStack = injectPluginStack(FormContainer);

function SectionEditor({ data, schema }) {
  console.log('SectionEditor', 'data', data);
  console.log('SectionEditor', 'schema', schema);
  const [store, setStore] = useState(() =>
    createStore(createOrderedMap(jsyaml.load(data))),
  );
  const resource = useMemo(() => getResourceObjFromUIStore(store), [store]);
  const schemaMap = useMemo(() => createOrderedMap(schema), [schema]);

  const onChange = actions => {
    setStore(prevStore => storeUpdater(actions)(prevStore));
  };

  return (
    <UIMetaProvider widgets={limitedWidgets}>
      <pre>{jsyaml.dump(store.toJS().values)}</pre>
      <UIStoreProvider
        store={store}
        showValidity={true}
        onChange={onChange}
        // rootRule={schemaRules}
      >
        <FormStack isRoot schema={schemaMap} resource={resource} />
      </UIStoreProvider>
    </UIMetaProvider>
  );
  /*
  <CreateResourceForm
    resource={resource}
    resourceType={resourceType}
    resourceUrl={resourceUrl}
    namespace={namespace}
    refetchList={silentRefetch}
    toggleFormFn={toggleFormFn}
    resourceSchema={resourceSchema}
    {...props}
  />
  */
}

export function BusolaExtensionDetails(props) {
  const { t } = useTranslation();
  const { extensibilitySchemas } = useMicrofrontendContext();
  console.log('extensibilitySchemas', extensibilitySchemas);
  const { namespace, name } = useParams();

  const resourceUrl = `/api/v1/namespaces/${namespace}/configmaps/${name}`;

  const updateResourceMutation = useUpdate(resourceUrl);
  const notification = useNotification();

  const BusolaExtensionEditor = resource => {
    const { data } = resource;
    return (
      <>
        {SECTIONS.map(key => (
          <ReadonlyEditorPanel
            editorProps={{ language: 'yaml' }}
            title={t(`extensibility.sections.${key}`)}
            value={data[key]}
            key={key + JSON.stringify(data[key])}
            actions={[
              extensibilitySchemas[key] ? (
                <ModalWithForm
                  // getToggleFormFn={getToggleFormFn}
                  title="[[edit]]"
                  // title={
                  // editActionLabel ||
                  // t('components.resource-details.edit', {
                  // resourceType: prettifiedResourceKind,
                  // })
                  // }
                  modalOpeningComponent={
                    <Button className="fd-margin-end--tiny" option="emphasized">
                      [[edit {key}]]
                      {/*editActionLabel ||
                      t('components.resource-details.edit', {
                        resourceType: prettifiedResourceKind,
                      })*/}
                    </Button>
                  }
                  confirmText={t('common.buttons.update')}
                  id={`edit-resource-modal`}
                  className="modal-size--l create-resource-modal"
                  renderForm={props => (
                    <ErrorBoundary>
                      <SectionEditor
                        data={data[key]}
                        schema={extensibilitySchemas[key]}
                      />
                    </ErrorBoundary>
                  )}
                />
              ) : (
                ''
              ),
            ]}
          />
        ))}
      </>
    );
  };

  const updateBusolaExtension = async (newBusolaExtension, configmap) => {
    try {
      const diff = createPatch(configmap, newBusolaExtension);
      await updateResourceMutation(resourceUrl, diff);
      notification.notifySuccess({
        content: t('components.resource-details.messages.success', {
          resourceType: 'BusolaExtension',
        }),
      });
    } catch (e) {
      console.error(e);
      notification.notifyError({
        content: t('components.resource-details.messages.failure', {
          resourceType: 'BusolaExtension',
          error: e.message,
        }),
      });
      throw e;
    }
  };

  const ExtensibilityVersion = configmap => {
    const { t } = useTranslation();
    const { isEnabled: isExtensibilityEnabled } = useFeature('EXTENSIBILITY');
    const hasExtensibilityLabel =
      configmap?.metadata?.labels &&
      configmap?.metadata?.labels['busola.io/extension'] === 'resource';

    if (!(isExtensibilityEnabled && hasExtensibilityLabel)) return null;

    const currentVersion = formatCurrentVersion(
      configmap?.metadata.labels?.[EXTENSION_VERSION_LABEL],
    );

    const hasMigrationFunction = getMigrationFunctions().some(
      version => version === currentVersion,
    );
    const isCurrentVersion = getLatestVersion() === currentVersion;
    const isSupportedVersion = getSupportedVersions().some(
      version => version === currentVersion,
    );

    const showMessage = () => {
      if (isCurrentVersion) {
        return null;
      } else if (isSupportedVersion) {
        return (
          <MessageStrip type="information" className="fd-margin-bottom--sm">
            {t('extensibility.message.old-version')}
          </MessageStrip>
        );
      } else if (hasMigrationFunction) {
        return (
          <MessageStrip type="error" className="fd-margin-bottom--sm">
            {t('extensibility.message.unsupported-version')}
          </MessageStrip>
        );
      } else {
        return (
          <MessageStrip type="error" className="fd-margin-bottom--sm">
            <Trans i18nKey="extensibility.message.unnown-version">
              <Link
                className="fd-link"
                url="https://github.com/kyma-project/busola/tree/main/docs/extensibility"
              />
            </Trans>
          </MessageStrip>
        );
      }
    };
    return (
      <LayoutPanel className="fd-margin--md">
        <LayoutPanel.Header>
          <LayoutPanel.Head title={t('extensibility.sections.version')} />
          <LayoutPanel.Actions>
            {hasMigrationFunction && (
              <>
                {currentVersion && (
                  <Button
                    disabled={currentVersion === getLatestVersion()}
                    glyph="forward" // generate-shortcut journey-arrive journey-change tools-opportunity trend-up
                    onClick={() => {
                      const newBusolaExtension = migrateToLatest(configmap);
                      updateBusolaExtension(newBusolaExtension, configmap);
                    }}
                  >
                    {t('config-maps.buttons.migrate')}
                  </Button>
                )}
              </>
            )}
          </LayoutPanel.Actions>
        </LayoutPanel.Header>
        <LayoutPanel.Body>
          {showMessage()}
          <LayoutPanelRow
            name={t('extensibility.version.current')}
            value={currentVersion || EMPTY_TEXT_PLACEHOLDER}
          />
          <LayoutPanelRow
            name={t('extensibility.version.latest')}
            value={getLatestVersion()}
          />
        </LayoutPanel.Body>
      </LayoutPanel>
    );
  };

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: secret => (
        <ControlledBy ownerReferences={secret.metadata.ownerReferences} />
      ),
    },
  ];

  return (
    <ResourceDetails
      customComponents={[ExtensibilityVersion, BusolaExtensionEditor]}
      customColumns={customColumns}
      createResourceForm={BusolaExtensionEdit}
      resourceTitle={t('extensibility.title')}
      resourceName={t('extensibility.title')}
      resourceType="ConfigMaps"
      resourceUrl={resourceUrl}
      breadcrumbs={[
        {
          name: t('extensibility.title'),
          path: '/',
          fromContext: 'busolaextensions',
        },
        { name: '' },
      ]}
    />
  );
}

export default BusolaExtensionDetails;
