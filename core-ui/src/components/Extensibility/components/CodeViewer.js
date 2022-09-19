import React from 'react';
import jsyaml from 'js-yaml';
import { isNil } from 'lodash';
import { useTranslation } from 'react-i18next';

import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';
import { isValidYaml } from 'shared/contexts/YamlEditorContext/isValidYaml';
import { useNotification } from 'shared/contexts/NotificationContext';
import { useGetTranslation } from '../helpers';
import { jsonataWrapper } from '../helpers/jsonataWrapper';

export function CodeViewer({ value, structure, originalResource, schema }) {
  const { widgetT } = useGetTranslation();
  const { t } = useTranslation();

  const notification = useNotification();

  const getLanguage = () => {
    const languageFormula = structure.language;
    if (languageFormula) {
      try {
        const expression = jsonataWrapper(languageFormula);
        expression.assign('root', originalResource);
        expression.assign('item', value);
        return (expression.evaluate() || '').toLowerCase();
      } catch (e) {
        console.warn(e);
        return 'json';
      }
    }
    return detectLanguage(value);
  };

  const getValueAndLang = (value, structure) => {
    let language = getLanguage(structure, value, originalResource);
    let parsedValue = '';

    if (!isNil(value)) {
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
