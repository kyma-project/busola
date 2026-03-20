import { useEffect, useMemo, useState } from 'react';
import jsyaml from 'js-yaml';
import { isNil } from 'lodash';
import { useTranslation } from 'react-i18next';

import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';
import { isValidYaml } from 'shared/contexts/YamlEditorContext/isValidYaml';
import { useNotification } from 'shared/contexts/NotificationContext';

import { useGetTranslation } from '../helpers';
import { useJsonata } from '../hooks/useJsonata';

interface CodeViewerProps {
  value: any;
  structure: any;
  originalResource: any;
  scope: any;
  arrayItems: any;
  singleRootResource: any;
  embedResource: any;
}

export function CodeViewer({
  value,
  structure,
  originalResource,
  scope,
  arrayItems,
  singleRootResource,
  embedResource,
}: CodeViewerProps) {
  const { widgetT } = useGetTranslation();
  const { t } = useTranslation();
  const notification = useNotification();
  const stableJsonataDeps = useMemo(
    () => ({
      resource: originalResource,
      parent: singleRootResource,
      embedResource: embedResource,
      scope,
      value,
      arrayItems,
    }),
    [
      originalResource,
      singleRootResource,
      embedResource,
      scope,
      value,
      arrayItems,
    ],
  );
  const jsonata = useJsonata(stableJsonataDeps);

  const [language, setLanguage] = useState<string | null>(null);

  useEffect(() => {
    jsonata(structure?.language, {}, detectLanguage(value)).then(
      ([lang]: any) => {
        setLanguage(lang?.toLowerCase());
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structure?.language, stableJsonataDeps]);

  const getValue = (value: any) => {
    if (!isNil(value)) {
      try {
        switch (language) {
          case 'yaml':
            return jsyaml.dump(value);
          default:
            //this includes JSON and other languages
            return stringifyIfObject(value);
        }
      } catch (e: any) {
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

  const parsedValue = getValue(value);

  return (
    <ReadonlyEditorPanel
      title={widgetT(structure)}
      value={parsedValue}
      editorProps={{ language, updateValueOnParentChange: true }}
    />
  );
}

function detectLanguage(value: any) {
  if (isValidYaml(value)) {
    return 'yaml';
  } else if (typeof value === 'object') {
    return 'json';
  } else if (typeof value === 'string') {
    return '';
  }
}

function stringifyIfObject(value: any) {
  return isNil(value)
    ? ''
    : typeof value !== 'string'
      ? JSON.stringify(value, null, 2)
      : value;
}
CodeViewer.array = true;
