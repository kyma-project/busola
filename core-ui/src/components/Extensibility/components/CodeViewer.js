import React from 'react';

import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';

import { useGetTranslation } from '../helpers';
import { isValidYaml } from 'shared/contexts/YamlEditorContext/isValidYaml';
import jsyaml from 'js-yaml';

export function CodeViewer({ value, structure, schema }) {
  const { widgetT } = useGetTranslation();

  const { parsedValue, language } = getValueAndLang(value, structure);
  return (
    <ReadonlyEditorPanel
      title={widgetT(structure)}
      value={parsedValue}
      editorProps={{ language }}
    />
  );
}

function detectLanguage(value) {
  if (isValidYaml(value)) {
    return 'yaml';
  } else if (typeof value === 'object') {
    return 'json';
  } else if (typeof value === 'string') {
    return '';
  }
}
function stringifyIfObject(value) {
  return typeof value !== 'string' ? JSON.stringify(value, null, 2) : value;
}

const getValueAndLang = (value, structure) => {
  let language = structure.language || detectLanguage(value);
  let parsedValue = '';

  try {
    switch (language) {
      case 'yaml':
        parsedValue = jsyaml.dump(value);
        break;
      default:
        //this includes JSON and other languages
        parsedValue = stringifyIfObject(value);
    }
  } catch (e) {
    window.alert(
      `CodeViewer: received resource is in a language other than defined: ${e}`,
    );
    language = '';
    parsedValue = stringifyIfObject(value);
  }

  return {
    parsedValue,
    language,
  };
};
