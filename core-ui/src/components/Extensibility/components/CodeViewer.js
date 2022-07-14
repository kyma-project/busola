import React from 'react';
import jsyaml from 'js-yaml';
import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';
import { isValidYaml } from 'shared/contexts/YamlEditorContext/isValidYaml';
import { useNotification } from 'shared/contexts/NotificationContext';
import { useGetTranslation } from '../helpers';
import { useTranslation } from 'react-i18next';

export function CodeViewer({ value, structure, schema }) {
  const { widgetT } = useGetTranslation();
  const { t } = useTranslation();

  const notification = useNotification();

  const getValueAndLang = (value, structure) => {
    let language = structure.language || detectLanguage(value);
    let parsedValue = '';

    if (value) {
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
        const errMessage = t('extensibility.widgets.code-viewer-error', {
          error: e.message,
        });
        console.warn(errMessage);
        notification.notifyError({
          content: errMessage,
        });
        language = '';
        parsedValue = stringifyIfObject(value);
      }
    }
    return {
      parsedValue,
      language,
    };
  };

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
