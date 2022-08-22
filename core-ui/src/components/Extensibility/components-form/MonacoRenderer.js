import React, { useCallback } from 'react';
import { Editor } from 'shared/components/MonacoEditorESM/Editor';
import { ResourceForm } from 'shared/ResourceForm';
import { useGetTranslation } from 'components/Extensibility/helpers';

const getValue = (storeKeys, resource) => {
  let value = resource;
  const keys = storeKeys.toJS();
  keys.forEach(key => (value = value?.[key]));
  return JSON.stringify(value, null, 2);
};

export function MonacoRenderer({
  storeKeys,
  // value,  //<-- doesn't work
  onChange,
  schema,
  required,
  resource,
}) {
  const { tFromStoreKeys } = useGetTranslation();

  const value = getValue(storeKeys, resource);

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
      title={tFromStoreKeys(storeKeys, schema)}
      required={required}
    >
      <Editor
        autocompletionDisabled
        updateValueOnParentChange
        value={value}
        language="json"
        onChange={handleChange}
      />
    </ResourceForm.CollapsibleSection>
  );
}
