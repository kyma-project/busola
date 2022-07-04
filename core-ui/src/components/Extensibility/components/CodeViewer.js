import React from 'react';

import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';

import { useGetTranslation } from '../helpers';
import { isValidYaml } from 'shared/contexts/YamlEditorContext/isValidYaml';
import jsyaml from 'js-yaml';

export function CodeViewer({ value, structure, schema }) {
  const { widgetT } = useGetTranslation();

  const { parsedValue, language } = getEditorValue(value, structure);
  return (
    <ReadonlyEditorPanel
      title={widgetT(structure)}
      value={parsedValue}
      editorProps={{ language }}
    />
  );
}

const getEditorValue = value => {
  let parsedValue = '';
  let language = '';

  if (isValidYaml(value)) {
    try {
      parsedValue = jsyaml.dump(value);
      language = 'yaml';
    } catch (e) {
      console.error(e);
    }
  } else if (typeof value === 'object') {
    try {
      parsedValue = JSON.stringify(value, null, 2);
      language = 'json';
    } catch (e) {
      console.error(e);
    }
  } else if (typeof value === 'string') {
    parsedValue = value;
  }

  return {
    parsedValue,
    language,
  };
};
