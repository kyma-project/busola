import { useState } from 'react';
import { SegmentedButton, SegmentedButtonItem } from '@ui5/webcomponents-react';
import EditorWrapper from 'shared/ResourceForm/fields/Editor';
import { useTranslation } from 'react-i18next';

import { JSONSchema } from './JSONSchema';

import './SchemaViewer.scss';
import { UI5Panel } from '../UI5Panel/UI5Panel';

const EDITOR_OPTIONS = {
  minimap: { enabled: false },
};

export function SchemaViewer({ name, schema }) {
  const [schemaMode, setSchemaMode] = useState('viewer');

  const { t } = useTranslation();

  return (
    <UI5Panel
      title={t('custom-resource-definitions.subtitle.schema')}
      accessibleName={t('custom-resource-definitions.accessible-name.schema')}
      keyComponent={`crd-schema-${name}`}
      headerActions={
        <>
          <SegmentedButton>
            <SegmentedButtonItem
              compact
              selected={schemaMode === 'viewer'}
              onClick={() => setSchemaMode('viewer')}
            >
              {t('schema.modes.viewer')}
            </SegmentedButtonItem>
            <SegmentedButtonItem
              compact
              selected={schemaMode === 'json'}
              onClick={() => setSchemaMode('json')}
            >
              {t('schema.modes.json')}
            </SegmentedButtonItem>
            <SegmentedButtonItem
              compact
              selected={schemaMode === 'yaml'}
              onClick={() => setSchemaMode('yaml')}
            >
              {t('schema.modes.yaml')}
            </SegmentedButtonItem>
          </SegmentedButton>
        </>
      }
    >
      {schemaMode === 'viewer' && (
        <div className="schema-viewer">
          <JSONSchema root={true} {...schema.openAPIV3Schema} />
        </div>
      )}
      {['json', 'yaml'].includes(schemaMode) && (
        <EditorWrapper
          language={schemaMode}
          autocompletionDisabled
          height="20em"
          value={schema}
          readOnly
          options={EDITOR_OPTIONS}
        />
      )}
    </UI5Panel>
  );
}
