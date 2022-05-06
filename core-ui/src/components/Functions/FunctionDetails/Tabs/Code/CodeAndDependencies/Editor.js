import React, { useCallback } from 'react';
import { Editor as MonacoEditor } from 'shared/components/MonacoEditorESM/Editor';

export default function Editor({
  id,
  language = '',
  controlledValue = '',
  setControlledValue = '',
  setValue,
  debouncedCallback = () => undefined,
}) {
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
      value={controlledValue}
      onChange={handleControlledChange}
      customSchemaId={id}
    />
  );
}
