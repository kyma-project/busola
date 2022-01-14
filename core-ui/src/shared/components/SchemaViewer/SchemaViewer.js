import React, { useState } from 'react';
import { LayoutPanel, Button, ButtonSegmented } from 'fundamental-react';
import { MonacoEditor, useTheme } from 'react-shared';
import { useTranslation } from 'react-i18next';
import jsyaml from 'js-yaml';

import { JSONSchema } from './JSONSchema';

import './SchemaViewer.scss';

export function SchemaViewer({ name, schema }) {
  const [schemaMode, setSchemaMode] = useState('viewer');
  const { editorTheme } = useTheme();

  const { t } = useTranslation();

  const jsonSchema = () => JSON.stringify(schema, null, 2);
  const yamlSchema = () => jsyaml.dump(schema, { noRefs: true });

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
          <MonacoEditor
            key={`crd-schema-editor-${name}`}
            theme={editorTheme}
            language="json"
            height="20em"
            value={jsonSchema()}
            options={{
              readOnly: true,
              minimap: {
                enabled: false,
              },
              scrollbar: {
                alwaysConsumeMouseWheel: false,
              },
            }}
          />
        )}
        {schemaMode === 'yaml' && (
          <MonacoEditor
            key={`crd-schema-editor-${name}`}
            theme={editorTheme}
            language="yaml"
            height="20em"
            value={yamlSchema()}
            options={{
              readOnly: true,
              minimap: {
                enabled: false,
              },
              scrollbar: {
                alwaysConsumeMouseWheel: false,
              },
            }}
          />
        )}
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
