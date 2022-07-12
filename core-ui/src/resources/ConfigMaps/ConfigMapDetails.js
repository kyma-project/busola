import React from 'react';
import { useTranslation } from 'react-i18next';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';
import { Button } from 'fundamental-react';
import { useFeature } from 'shared/hooks/useFeature';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import {
  getLatestVersion,
  migrateToLatest,
} from '../../components/Extensibility/migration';

import { ConfigMapCreate } from './ConfigMapCreate';

export function ConfigMapDetails(props) {
  const { t } = useTranslation();
  const { isEnabled: isExtensibilityEnabled } = useFeature('EXTENSIBILITY');

  const { data: configmap } = useGet(props.resourceUrl, {});
  const hasExtensibilityLabel =
    configmap?.metadata?.labels['busola.io/extension'] === 'resource';

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

  const headerActions = (
    <>
      {isExtensibilityEnabled && hasExtensibilityLabel && (
        <>
          {configmap?.data?.version && (
            <Button
              disabled={
                configmap?.data?.version === JSON.stringify(getLatestVersion())
              }
              glyph="forward" // generate-shortcut journey-arrive journey-change tools-opportunity trend-up
              onClick={() => {
                migrateToLatest(configmap);
                // TO DO update resource
              }}
            >
              {t('config-maps.buttons.migrate')}
            </Button>
          )}
        </>
      )}
    </>
  );

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: secret => (
        <ControlledBy ownerReferences={secret.metadata.ownerReferences} />
      ),
    },
  ];

  if (isExtensibilityEnabled && hasExtensibilityLabel) {
    customColumns.push({
      header: t('common.headers.version'),
      value: resource =>
        JSON.parse(resource.data?.version || null) || EMPTY_TEXT_PLACEHOLDER,
    });
  }

  return (
    <ResourceDetails
      customComponents={[ConfigMapEditor]}
      customColumns={customColumns}
      createResourceForm={ConfigMapCreate}
      headerActions={headerActions}
      {...props}
    />
  );
}

export default ConfigMapDetails;
