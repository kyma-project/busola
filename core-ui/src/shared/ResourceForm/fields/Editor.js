import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import jsyaml from 'js-yaml';
import * as jp from 'jsonpath';
import { Editor as MonacoEditor } from 'shared/components/MonacoEditorESM/Editor';

export function Editor({
  value,
  onChange,
  setValue,
  language = 'yaml',
  convert = true,
  customSchemaId,
  ...props
}) {
  const { t } = useTranslation();
  const [error, setError] = useState('');

  const parsedValue = React.useMemo(() => {
    if (!convert) {
      return value;
    } else if (language === 'yaml') {
      return jsyaml.dump(JSON.parse(JSON.stringify(value), { noRefs: true }));
    } else if (language === 'json') {
      return JSON.stringify(value, null, 2);
    } else {
      return value;
    }
  }, [value, language, convert]);

  // TODO (task created) schema is lost if user deletes all the resource with the exception of one line, goes to simple and returns to editor
  const resourceSchemaId = useRef(
    convert
      ? `${jp.value(value, `$.apiVersion`)}/${jp.value(value, `$.kind`)}`
      : '',
  );

  const handleChange = useCallback(
    text => {
      if (!convert) {
        setValue(text);
        return;
      }
      try {
        let parsed = {};
        if (language === 'yaml') {
          parsed = jsyaml.load(text);
        } else if (language === 'json') {
          parsed = JSON.parse(text);
        }
        if (typeof parsed !== 'object' || !parsed) {
          setError(t('common.create-form.object-required'));
          return;
        }
        if (typeof onChange === 'function') onChange(parsed);
        if (typeof setValue === 'function') setValue(parsed);

        setError(null);
      } catch ({ message }) {
        // get the message until the newline
        setError(message.substr(0, message.indexOf('\n')));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setError, t, language],
  );
  return (
    <MonacoEditor
      {...props}
      language={language}
      value={parsedValue}
      onChange={handleChange}
      error={error}
      customSchemaId={customSchemaId || resourceSchemaId.current}
    />
  );
}

export default Editor;
