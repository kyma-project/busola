import React from 'react';

import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';

import { useGetTranslation } from '../helpers';

export function CodeViewer({ value, structure, schema }) {
  const { widgetT } = useGetTranslation();

  return (
    <ReadonlyEditorPanel
      title={widgetT(structure)}
      value={JSON.stringify(value, null, 2)}
      editorProps={{ language: structure.language || '' }}
    />
  );
}
