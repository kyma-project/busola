import React, { useCallback } from 'react';
import { Editor as MonacoEditor } from 'shared/components/MonacoEditorESM/Editor';
import { useTheme } from 'shared/contexts/ThemeContext';

export default function Editor({
  id,
  language = '',
  controlledValue = '',
  setControlledValue = '',
  setValue,
  debouncedCallback = () => undefined,
}) {
  const { editorTheme } = useTheme();

  const handleControlledChange = useCallback(
    value => {
      setValue(value);
      setControlledValue(value);
      debouncedCallback();
    },
    [debouncedCallback, setValue, setControlledValue],
  );

  return (
    <MonacoEditor
      autocompletionDisabled
      height="30em"
      language={language}
      theme={editorTheme}
      value={controlledValue}
      onChange={handleControlledChange}
      customSchemaId={id}
    />
  );
}
