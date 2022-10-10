import React, { useCallback } from 'react';
import jsyaml from 'js-yaml';
import { Editor } from 'shared/components/MonacoEditorESM/Editor';
import { ResourceForm } from 'shared/ResourceForm';
import { useGetTranslation } from 'components/Extensibility/helpers';
import { jsonataWrapper } from '../helpers/jsonataWrapper';
import { Label } from '../../../shared/ResourceForm/components/Label';

function getValue(storeKeys, resource) {
  let value = resource;
  const keys = storeKeys.toJS();
  keys.forEach(key => (value = value?.[key]));
  return value;
}

function formatValue(value, language) {
  if (language === 'json') {
    return JSON.stringify(value, null, 2);
  } else if (language === 'yaml') {
    return typeof value === 'undefined' ? '' : jsyaml.dump(value);
  } else {
    return value;
  }
}

function getLanguage(schema, value, resource) {
  const languageFormula = schema.get('language');
  try {
    const expression = jsonataWrapper(languageFormula);
    expression.assign('root', resource);
    expression.assign('item', value);
    return (expression.evaluate() || '').toLowerCase();
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
  const { tFromStoreKeys, t: tExt } = useGetTranslation();

  const value = getValue(storeKeys, resource);
  const language = getLanguage(schema, value, resource);
  const formattedValue = formatValue(value, language);
  const defaultOpen = schema.get('defaultOpen');

  const handleChange = useCallback(
    value => {
      let parsedValue = value;
      if (language === 'json') {
        try {
          parsedValue = JSON.parse(value);
        } catch (e) {}
      } else if (language === 'yaml') {
        try {
          parsedValue = jsyaml.load(value);
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
  const inputInfo = schema.get('inputInfo');
  const tooltipContent = schema.get('description');

  return (
    <ResourceForm.CollapsibleSection
      title={tFromStoreKeys(storeKeys, schema)}
      required={schemaRequired ?? required}
      defaultOpen={defaultOpen}
    >
      <div className="fd-margin-bottom--sm">
        <Label
          required={schemaRequired ?? required}
          tooltipContent={tExt(tooltipContent)}
        >
          {tFromStoreKeys(storeKeys, schema)}
        </Label>
      </div>
      <Editor
        autocompletionDisabled
        updateValueOnParentChange
        value={formattedValue}
        language={language}
        onChange={handleChange}
      />
      {inputInfo && (
        <p style={{ color: 'var(--sapNeutralTextColor)' }}>{tExt(inputInfo)}</p>
      )}
    </ResourceForm.CollapsibleSection>
  );
}
