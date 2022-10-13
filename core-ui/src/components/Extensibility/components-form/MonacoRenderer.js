import React, { useCallback } from 'react';
import jsyaml from 'js-yaml';

import { Editor } from 'shared/components/MonacoEditorESM/Editor';
import { ResourceForm } from 'shared/ResourceForm';
import { useGetTranslation } from 'components/Extensibility/helpers';

import { Label } from '../../../shared/ResourceForm/components/Label';
import { useJsonata } from '../hooks/useJsonata';

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

function getLanguage(jsonata, schema, value, resource) {
  const languageFormula = schema.get('language');
  const [language, error] = jsonata(languageFormula);

  return error ? 'json' : (language || '').toLowerCase();
}

export function MonacoRenderer({
  storeKeys,
  // value,  //<-- doesn't work
  onChange,
  schema,
  required,
  resource,
  originalResource,
}) {
  const { tFromStoreKeys, t: tExt } = useGetTranslation();

  const value = getValue(storeKeys, resource);
  const jsonata = useJsonata({
    resource: originalResource,
    scope: value,
    value,
  });

  const language = getLanguage(jsonata, schema, value, resource);
  const formattedValue = formatValue(value, language);
  const defaultOpen = schema.get('defaultExpanded');

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
