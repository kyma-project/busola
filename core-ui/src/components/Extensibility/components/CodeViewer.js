import React from 'react';
import jsyaml from 'js-yaml';
import { isNil } from 'lodash';
import { useTranslation } from 'react-i18next';

import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';
import { isValidYaml } from 'shared/contexts/YamlEditorContext/isValidYaml';
import { useNotification } from 'shared/contexts/NotificationContext';

import { useGetTranslation } from '../helpers';
import { useJsonata } from '../hooks/useJsonata';

export function CodeViewer({
  value,
  structure,
  originalResource,
  schema,
  scope,
  arrayItems,
}) {
  const { widgetT } = useGetTranslation();
  const { t } = useTranslation();

  const notification = useNotification();

  const jsonata = useJsonata({
    resource: originalResource,
    scope,
    value,
    arrayItems,
  });
  let [language] = jsonata(structure.language, {}, detectLanguage(value));
  language = language.toLowerCase();

  const getValue = (value, structure) => {
    if (!isNil(value)) {
      try {
        switch (language) {
          case 'yaml':
            return jsyaml.dump(value);
          default:
            //this includes JSON and other languages
            return stringifyIfObject(value);
        }
      } catch (e) {
        const errMessage = t('extensibility.widgets.code-viewer-error', {
          error: e.message,
        });
        console.warn(errMessage);
        notification.notifyError({
          content: errMessage,
        });
        return stringifyIfObject(value);
      }
    }
    return '';
  };

  const parsedValue = getValue(value, structure);

  return (
    <ReadonlyEditorPanel
      title={widgetT(structure)}
      value={parsedValue}
      editorProps={{ language, updateValueOnParentChange: true }}
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
  return isNil(value)
    ? ''
    : typeof value !== 'string'
    ? JSON.stringify(value, null, 2)
    : value;
}
CodeViewer.array = true;
