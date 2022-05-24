import React from 'react';
import { useGetTranslation } from './helpers';
import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';

export function CodeViewer({ value, structure, schema }) {
  const { t } = useGetTranslation();
  const key = structure.path || structure.id;

  return (
    <ReadonlyEditorPanel
      title={t(key)}
      key={t(key)}
      value={JSON.stringify(value, null, 2)}
      editorProps={{ language: structure.language || '' }}
    />
  );
}
