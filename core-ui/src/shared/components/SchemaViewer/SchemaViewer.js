import React, { useState } from 'react';
import { LayoutPanel, Button, ButtonSegmented } from 'fundamental-react';
import EditorWrapper from 'shared/ResourceForm/fields/Editor';
import { useTranslation } from 'react-i18next';

import { JSONSchema } from './JSONSchema';

import './SchemaViewer.scss';

export function SchemaViewer({ name, schema }) {
  const [schemaMode, setSchemaMode] = useState('viewer');

  const { t } = useTranslation();

  return (
    <LayoutPanel key={`crd-schema-${name}`} className="fd-margin--md">
      <LayoutPanel.Header>
        <LayoutPanel.Head
          title={t('custom-resource-definitions.subtitle.schema')}
        />
        <LayoutPanel.Actions>
          <ButtonSegmented>
            <Button
              compact
              selected={schemaMode === 'viewer'}
              onClick={() => setSchemaMode('viewer')}
            >
              {t('schema.modes.viewer')}
            </Button>
            <Button
              compact
              selected={schemaMode === 'json'}
              onClick={() => setSchemaMode('json')}
            >
              {t('schema.modes.json')}
            </Button>
            <Button
              compact
              selected={schemaMode === 'yaml'}
              onClick={() => setSchemaMode('yaml')}
            >
              {t('schema.modes.yaml')}
            </Button>
          </ButtonSegmented>
        </LayoutPanel.Actions>
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        {schemaMode === 'viewer' && (
          <div className="schema-viewer">
            <JSONSchema root={true} {...schema.openAPIV3Schema} />
          </div>
        )}
        {schemaMode === 'json' && (
          <EditorWrapper
            customSchemaId={`crd-schema-editor-${name}`}
            language="json"
            height="20em"
            value={schema}
            autocompletionDisabled
            readOnly
            options={{
              minimap: {
                enabled: false,
              },
            }}
          />
        )}
        {schemaMode === 'yaml' && (
          <EditorWrapper
            customSchemaId={`crd-schema-editor-${name}`}
            language="yaml"
            autocompletionDisabled
            height="20em"
            value={schema}
            readOnly
            options={{
              minimap: {
                enabled: false,
              },
            }}
          />
        )}
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
