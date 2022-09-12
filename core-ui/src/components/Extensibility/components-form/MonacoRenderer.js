import React, { useCallback } from 'react';
import { Editor } from 'shared/components/MonacoEditorESM/Editor';
import { ResourceForm } from 'shared/ResourceForm';
import { useGetTranslation } from 'components/Extensibility/helpers';
import { jsonataWrapper } from '../helpers/jsonataWrapper';

function getValue(storeKeys, resource) {
  let value = resource;
  const keys = storeKeys.toJS();
  keys.forEach(key => (value = value?.[key]));
  return value;
}

function formatValue(value, language) {
  if (language === 'json') {
    return JSON.stringify(value, null, 2);
  } else {
    return value;
  }
}

// todo add docs
function getLanguage(schema, value, resource) {
  const languageFormula = schema.get('language');
  try {
    const expression = jsonataWrapper(languageFormula);
    expression.assign('root', resource);
    expression.assign('item', value);
    return expression.evaluate();
  } catch (e) {
    console.warn(e);
    return 'json';
  }
}

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
  const language = getLanguage(schema, value, resource);
  const formattedValue = formatValue(value, language);
  // console.log({ value, language, formattedValue });

  const handleChange = useCallback(
    value => {
      let parsedValue = value;
      if (language === 'json') {
        try {
          parsedValue = JSON.parse(value);
        } catch (e) {}
      }

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
    [required, language],
  );
  const schemaRequired = schema.get('required');

  return (
    <ResourceForm.CollapsibleSection
      title={tFromStoreKeys(storeKeys, schema)}
      required={schemaRequired ?? required}
    >
      <Editor
        autocompletionDisabled
        updateValueOnParentChange
        value={formattedValue}
        language={language}
        onChange={handleChange}
      />
    </ResourceForm.CollapsibleSection>
  );
}
