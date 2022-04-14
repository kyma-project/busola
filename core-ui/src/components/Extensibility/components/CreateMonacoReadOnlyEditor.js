import React from 'react';
import { getValue, useGetTranslation } from './helpers';
import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';

export const CreateReadOnlyEditor = monacoMetadata => {
  const ReadOnlyEditor = resource => {
    const translate = useGetTranslation();
    const value = getValue(resource, monacoMetadata.resource);
    return (
      <ReadonlyEditorPanel
        title={translate(monacoMetadata.title)}
        key={translate(monacoMetadata.title)}
        value={JSON.stringify(value, null, 2)}
        editorProps={{ language: monacoMetadata.language || '' }}
      />
    );
  };
  return ReadOnlyEditor;
};
