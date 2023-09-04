import React, { useState } from 'react';
import {
  Panel,
  SegmentedButton,
  SegmentedButtonItem,
  Title,
  Toolbar,
  ToolbarSpacer,
} from '@ui5/webcomponents-react';
import EditorWrapper from 'shared/ResourceForm/fields/Editor';
import { useTranslation } from 'react-i18next';

import { JSONSchema } from './JSONSchema';

import './SchemaViewer.scss';

export function SchemaViewer({ name, schema }) {
  const [schemaMode, setSchemaMode] = useState('viewer');

  const { t } = useTranslation();

  return (
    <Panel
      fixed
      key={`crd-schema-${name}`}
      className="fd-margin--md"
      header={
        <Toolbar>
          <Title level="H4">
            {t('custom-resource-definitions.subtitle.schema')}
          </Title>
          <ToolbarSpacer />
          <SegmentedButton>
            <SegmentedButtonItem
              compact
              pressed={schemaMode === 'viewer'}
              onClick={() => setSchemaMode('viewer')}
            >
              {t('schema.modes.viewer')}
            </SegmentedButtonItem>
            <SegmentedButtonItem
              compact
              pressed={schemaMode === 'json'}
              onClick={() => setSchemaMode('json')}
            >
              {t('schema.modes.json')}
            </SegmentedButtonItem>
            <SegmentedButtonItem
              compact
              pressed={schemaMode === 'yaml'}
              onClick={() => setSchemaMode('yaml')}
            >
              {t('schema.modes.yaml')}
            </SegmentedButtonItem>
          </SegmentedButton>
        </Toolbar>
      }
    >
      {schemaMode === 'viewer' && (
        <div className="schema-viewer">
          <JSONSchema root={true} {...schema.openAPIV3Schema} />
        </div>
      )}
      {schemaMode === 'json' && (
        <EditorWrapper
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
    </Panel>
  );
}
