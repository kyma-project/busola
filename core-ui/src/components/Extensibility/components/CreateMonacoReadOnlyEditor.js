import React from 'react';
import { getValue, useGetTranslation } from './helpers';
import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';

export const CreateReadOnlyEditor = monacoMetadata => resource => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const translate = useGetTranslation();

  const value = getValue(resource, monacoMetadata.valuePath);
  return (
    <ReadonlyEditorPanel
      title={translate(monacoMetadata.title)}
      key={translate(monacoMetadata.title)}
      value={JSON.stringify(value, null, 2)}
      editorProps={{ language: monacoMetadata.language || '' }}
    />
  );
};
