import {
  useMemo,
  useCallback,
  useState,
  Dispatch,
  SetStateAction,
} from 'react';
import { useTranslation } from 'react-i18next';
import jsyaml from 'js-yaml';
import { Editor as MonacoEditor } from 'shared/components/MonacoEditorESM/Editor';

type EditorProps = {
  value: any;
  onChange?: (value: any) => void;
  setValue?: (value: any) => void;
  language?: 'yaml' | 'json' | string;
  convert?: boolean;
  schemaId?: string;
  setEditorError?: Dispatch<SetStateAction<string | null>>;
  schema?: any;
  [key: string]: any;
};

export function Editor({
  value,
  onChange,
  setValue,
  language = 'yaml',
  convert = true,
  schemaId,
  setEditorError,
  schema,
  ...props
}: EditorProps) {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>('');
  const parsedValue = useMemo(() => {
    if (!value) {
      return undefined;
    }
    if (!convert) {
      return value;
    } else if (language === 'yaml') {
      return jsyaml.dump(JSON.parse(JSON.stringify(value)), {
        noRefs: true,
        lineWidth: -1,
      });
    } else if (language === 'json') {
      return JSON.stringify(value, null, 2);
    } else {
      return value;
    }
  }, [value, language, convert]);

  const handleChange = useCallback(
    (text: string) => {
      const placeholder = (
        document.getElementsByClassName(
          'resource-form__placeholder',
        ) as HTMLCollectionOf<HTMLElement>
      )[0];
      if (placeholder) {
        if (text) {
          placeholder.style['display'] = 'none';
        } else {
          placeholder.style['display'] = 'block';
        }
      }

      if (!convert) {
        setValue?.(text);
        return;
      }
      try {
        let parsed: unknown = {};
        if (language === 'yaml') {
          parsed = jsyaml.load(text);
        } else if (language === 'json') {
          parsed = JSON.parse(text);
        }
        if (typeof parsed !== 'object' || !parsed) {
          setError(t('common.create-form.object-required'));
          if (typeof setEditorError === 'function')
            setEditorError(t('common.create-form.object-required'));
          return;
        }
        if (typeof onChange === 'function') onChange(parsed);
        if (typeof setValue === 'function') setValue(parsed);

        setError(null);
        if (typeof setEditorError === 'function') setEditorError(null);
      } catch (error) {
        const message = error instanceof Error ? error?.message : '';
        // get the message until the newline
        setError(message.substr(0, message.indexOf('\n')));
        if (typeof setEditorError === 'function')
          setEditorError(message.substr(0, message.indexOf('\n')));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setError, t, language, value],
  );

  return (
    <MonacoEditor
      {...props}
      language={language}
      value={parsedValue}
      onChange={handleChange}
      error={error}
      schemaId={schemaId}
      /*@ts-expect-error Type mismatch between js and ts*/
      placeholder={t('clusters.wizard.editor-placeholder')}
      schema={schema}
    />
  );
}

export default Editor;
