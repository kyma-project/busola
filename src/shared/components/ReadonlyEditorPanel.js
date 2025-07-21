import { EditorActions } from 'shared/contexts/YamlEditorContext/EditorActions';
import { Editor } from 'shared/components/MonacoEditorESM/Editor';
import { UI5Panel } from './UI5Panel/UI5Panel';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Button } from '@ui5/webcomponents-react';
import { base64Decode } from 'shared/helpers';

const EDITOR_OPTIONS = {
  minimap: { enabled: false },
};

export function ReadonlyEditorPanel({
  title,
  value,
  editorProps,
  actions,
  isBase64 = false,
}) {
  const { t } = useTranslation();
  const [editor, setEditor] = useState(null);
  const [isEncoded, setEncoded] = useState(true);
  const [valueState, setValueState] = useState(value);

  useEffect(() => {
    setValueState(value);
  }, [value]);

  const decode = () => {
    setEncoded(true);
    setValueState(value);
  };
  const encode = () => {
    setEncoded(false);
    setValueState(base64Decode(value));
  };

  const headerActions =
    actions ||
    (isBase64 && (
      <>
        {actions && actions}
        {isBase64 && (
          <Button
            design="Transparent"
            icon={isEncoded ? 'show' : 'hide'}
            disabled={!value}
            onClick={() => {
              return isEncoded ? encode() : decode();
            }}
          >
            {isEncoded
              ? t('secrets.buttons.decode')
              : t('secrets.buttons.encode')}
          </Button>
        )}
      </>
    ));

  return (
    <UI5Panel title={title} headerActions={headerActions}>
      <EditorActions
        val={valueState}
        editor={editor}
        title={title}
        saveDisabled={true}
      />
      <Editor
        height="20em"
        value={valueState}
        options={EDITOR_OPTIONS}
        onMount={setEditor}
        autocompletionDisabled
        readOnly
        {...editorProps}
      />
    </UI5Panel>
  );
}
