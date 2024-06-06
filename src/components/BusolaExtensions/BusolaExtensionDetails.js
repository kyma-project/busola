import { ExternalLink } from 'shared/components/ExternalLink/ExternalLink';
import { Trans, useTranslation } from 'react-i18next';
import { createPatch } from 'rfc6902';
import { Button, MessageStrip } from '@ui5/webcomponents-react';
import { useRecoilValue } from 'recoil';

import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';
import { useFeature } from 'hooks/useFeature';
import { useUpdate } from 'shared/hooks/BackendAPI/useMutation';
import { useNotification } from 'shared/contexts/NotificationContext';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { ModalWithForm } from 'shared/components/ModalWithForm/ModalWithForm';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { extensibilitySchemasState } from 'state/extensibilitySchemasAtom';
import { useUrl } from 'hooks/useUrl';
import { spacing } from '@ui5/webcomponents-react-base';

import {
  formatCurrentVersion,
  getLatestVersion,
  getSupportedVersions,
  migrateToLatest,
  getMigrationFunctions,
} from '../../components/Extensibility/migration';
import { SectionEditor } from './SectionEditor';

import { BusolaExtensionEdit } from './BusolaExtensionEdit';
import { SECTIONS } from './helpers';
import { EXTENSION_VERSION_LABEL } from './constants';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';

export function BusolaExtensionDetails({ name, namespace }) {
  const { t } = useTranslation();
  const extensibilitySchemas = useRecoilValue(extensibilitySchemasState);

  const { clusterUrl } = useUrl();

  const resourceUrl = `/api/v1/namespaces/${namespace}/configmaps/${name}`;

  const updateResourceMutation = useUpdate(resourceUrl);
  const notification = useNotification();

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
              <ModalWithForm
                title={t('extensibility.edit-section', {
                  section: t(`extensibility.sections.${key}`),
                })}
                modalOpeningComponent={
                  <Button
                    style={spacing.sapUiTinyMarginEnd}
                    design="Emphasized"
                  >
                    {t('extensibility.edit-section', {
                      section: t(`extensibility.sections.${key}`),
                    })}
                  </Button>
                }
                confirmText={t('common.buttons.save')}
                id={`edit-resource-modal`}
                className="modal-size--l"
                renderForm={props => (
                  <ErrorBoundary>
                    <SectionEditor
                      {...props}
                      onlyYaml={!extensibilitySchemas[key]}
                      data={data[key]}
                      schema={extensibilitySchemas[key]}
                      resource={data}
                      onSubmit={newData => {
                        const newResource = {
                          ...resource,
                          data: {
                            ...data,
                            [key]: newData,
                          },
                        };
                        updateBusolaExtension(newResource, resource);
                      }}
                    />
                  </ErrorBoundary>
                )}
              />,
            ]}
          />
        ))}
      </>
    );
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
          <MessageStrip
            design="Information"
            hideCloseButton
            style={spacing.sapUiSmallMarginBottom}
          >
            {t('extensibility.message.old-version')}
          </MessageStrip>
        );
      } else if (hasMigrationFunction) {
        return (
          <MessageStrip
            design="Negative"
            hideCloseButton
            style={spacing.sapUiSmallMarginBottom}
          >
            {t('extensibility.message.unsupported-version')}
          </MessageStrip>
        );
      } else {
        return (
          <MessageStrip
            design="Negative"
            hideCloseButton
            style={spacing.sapUiSmallMarginBottom}
          >
            <Trans i18nKey="extensibility.message.unnown-version">
              <ExternalLink url="https://github.com/kyma-project/busola/tree/main/docs/extensibility" />
            </Trans>
          </MessageStrip>
        );
      }
    };
    return (
      <UI5Panel
        keyComponent="extensibility-version"
        title={t('extensibility.sections.version')}
        headerActions={
          hasMigrationFunction && (
            <>
              {currentVersion && (
                <>
                  <Button
                    disabled={currentVersion === getLatestVersion()}
                    icon="forward"
                    iconEnd
                    onClick={() => {
                      const newBusolaExtension = migrateToLatest(configmap);
                      updateBusolaExtension(newBusolaExtension, configmap);
                    }}
                  >
                    {t('config-maps.buttons.migrate')}
                  </Button>
                </>
              )}
            </>
          )
        }
      >
        {showMessage()}
        <LayoutPanelRow
          name={t('extensibility.version.current')}
          value={currentVersion || EMPTY_TEXT_PLACEHOLDER}
        />
        <LayoutPanelRow
          name={t('extensibility.version.latest')}
          value={getLatestVersion()}
        />
      </UI5Panel>
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
      layoutCloseCreateUrl={clusterUrl('busolaextensions')}
    />
  );
}

export default BusolaExtensionDetails;
