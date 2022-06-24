import React, { useCallback } from 'react';
import { Editor } from 'shared/components/MonacoEditorESM/Editor';
import { TransTitle } from '@ui-schema/ui-schema/Translate/TransTitle';
import { ResourceForm } from 'shared/ResourceForm';

export function MonacoRenderer({
  storeKeys,
  value,
  onChange,
  schema,
  required,
}) {
  const handleChange = useCallback(
    value => {
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
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [required],
  );

  return (
    <ResourceForm.CollapsibleSection
      title={<TransTitle schema={schema} storeKeys={storeKeys} />}
    >
      <Editor
        autocompletionDisabled
        value={value}
        language="json"
        onChange={handleChange}
      />
    </ResourceForm.CollapsibleSection>
  );
}
