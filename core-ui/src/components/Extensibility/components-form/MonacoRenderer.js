import React from 'react';
import { Editor } from 'shared/components/MonacoEditorESM/Editor';
import { ResourceForm } from 'shared/ResourceForm';
import { useGetTranslation } from 'components/Extensibility/helpers';

export function MonacoRenderer({
  storeKeys,
  value,
  onChange,
  schema,
  required,
}) {
  const { tFromStoreKeys } = useGetTranslation();
  return (
    <ResourceForm.CollapsibleSection title={tFromStoreKeys(storeKeys)}>
      <Editor
        autocompletionDisabled
        value={value}
        language="json"
        onChange={value => {
          let parsedValue = value;
          try {
            parsedValue = JSON.parse(value);
          } catch (e) {}

          onChange({
            storeKeys,
            scopes: ['value'],
            type: 'set',
            schema,
            required,
            data: { value: parsedValue },
          });
        }}
      />
    </ResourceForm.CollapsibleSection>
  );
}
