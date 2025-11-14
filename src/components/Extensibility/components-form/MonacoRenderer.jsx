import { useCallback, useEffect, useMemo, useState } from 'react';
import jsyaml from 'js-yaml';

import { Editor } from 'shared/components/MonacoEditorESM/Editor';
import { ResourceForm } from 'shared/ResourceForm';
import { Label } from '../../../shared/ResourceForm/components/Label';

import { useGetTranslation } from 'components/Extensibility/helpers';
import { useJsonata } from '../hooks/useJsonata';

function getValue(storeKeys, resource) {
  let value = resource;
  const keys = storeKeys.toJS();
  keys.forEach((key) => {
    return (value = value?.[key]);
  });
  return value;
}

function formatValue(value, language, formatAsString) {
  if (language === 'json' && !formatAsString) {
    return JSON.stringify(value, null, 2);
  } else if (language === 'yaml') {
    return typeof value === 'undefined'
      ? ''
      : jsyaml.dump(value, { lineWidth: -1 });
  } else {
    return value;
  }
}

async function getLanguage(jsonata, schema) {
  const languageFormula = schema.get('language');
  if (!languageFormula) return 'json';

  const [language, error] = await jsonata(languageFormula);
  return error ? 'json' : (language || '').toLowerCase();
}

export function MonacoRenderer({
  storeKeys,
  // value,  //<-- doesn't work
  onChange,
  schema,
  required,
  resource,
  nestingLevel = 0,
}) {
  const { tFromStoreKeys, t: tExt } = useGetTranslation();
  const value = useMemo(
    () => getValue(storeKeys, resource),
    [storeKeys, resource],
  );
  const stableJsonataDeps = useMemo(
    () => ({
      resource,
      scope: value,
      value,
    }),
    [resource, value],
  );
  const jsonata = useJsonata(stableJsonataDeps);

  const [language, setLanguage] = useState('');

  useEffect(() => {
    getLanguage(jsonata, schema).then((res) => setLanguage(res));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schema, stableJsonataDeps]);

  const formatAsString = schema.get('formatAsString') ?? false;
  const formattedValue = formatValue(value, language, formatAsString);
  const defaultOpen = schema.get('defaultExpanded') ?? false;

  const handleChange = useCallback(
    (value) => {
      let parsedValue = value;
      if (language === 'json' && !formatAsString) {
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

  const inputInfo = schema.get('inputInfo');
  const tooltipContent = schema.get('description');

  return (
    <ResourceForm.CollapsibleSection
      title={tFromStoreKeys(storeKeys, schema)}
      required={required}
      defaultOpen={defaultOpen}
      nestingLevel={nestingLevel}
      tooltipContent={tExt(tooltipContent)}
    >
      <div className="sap-margin-bottom-tiny">
        <Label required={required}>{tFromStoreKeys(storeKeys, schema)}</Label>
      </div>
      <div className="bsl-col-md--11">
        <Editor
          autocompletionDisabled
          updateValueOnParentChange
          value={formattedValue}
          language={language}
          onChange={handleChange}
        />
        {inputInfo && (
          <p style={{ color: 'var(--sapNeutralTextColor)' }}>
            {tExt(inputInfo)}
          </p>
        )}
      </div>
    </ResourceForm.CollapsibleSection>
  );
}
