import React from 'react';
import { Link } from 'shared/components/Link/Link';
import { Trans, useTranslation } from 'react-i18next';
import { createPatch } from 'rfc6902';

import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';
import { Button } from 'fundamental-react';
import { useFeature } from 'shared/hooks/useFeature';
import { useUpdate } from 'shared/hooks/BackendAPI/useMutation';
import { useNotification } from 'shared/contexts/NotificationContext';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { LayoutPanel, MessageStrip } from 'fundamental-react';

import { prettifyNameSingular } from 'shared/utils/helpers';

import {
  formatCurrentVersion,
  getLatestVersion,
  getSupportedVersions,
  migrateToLatest,
  getMigrationFunctions,
} from '../../components/Extensibility/migration';

import { ConfigMapCreate } from './ConfigMapCreate';

export function ConfigMapDetails(props) {
  const { t } = useTranslation();

  const updateResourceMutation = useUpdate(props.resourceUrl);
  const notification = useNotification();

  const prettifiedResourceKind = prettifyNameSingular(
    props.resourceTitle,
    props.resourceType,
  );

  const ConfigMapEditor = resource => {
    const { data } = resource;
    return Object.keys(data || {}).map(key => (
      <ReadonlyEditorPanel
        title={key}
        value={data[key]}
        key={key + JSON.stringify(data[key])}
      />
    ));
  };

  const updateConfigMap = async (newConfigMap, configmap) => {
    try {
      const diff = createPatch(configmap, newConfigMap);
      await updateResourceMutation(props.resourceUrl, diff);
      notification.notifySuccess({
        content: t('components.resource-details.messages.success', {
          resourceType: prettifiedResourceKind,
        }),
      });
    } catch (e) {
      console.error(e);
      notification.notifyError({
        content: t('components.resource-details.messages.failure', {
          resourceType: prettifiedResourceKind,
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

    const currentVersion = formatCurrentVersion(configmap?.data?.version);
    const hasMigrationFunction = getMigrationFunctions().some(
      version => version === currentVersion?.replace('.', ''),
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
          <LayoutPanel.Head title={t('extensibility.title')} />
          <LayoutPanel.Actions>
            {hasMigrationFunction && (
              <>
                {currentVersion && (
                  <Button
                    disabled={currentVersion === getLatestVersion()}
                    glyph="forward" // generate-shortcut journey-arrive journey-change tools-opportunity trend-up
                    onClick={() => {
                      const newConfigMap = migrateToLatest(configmap);
                      updateConfigMap(newConfigMap, configmap);
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
      customComponents={[ExtensibilityVersion, ConfigMapEditor]}
      customColumns={customColumns}
      createResourceForm={ConfigMapCreate}
      {...props}
    />
  );
}

export default ConfigMapDetails;
