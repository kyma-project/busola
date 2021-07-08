import React, { useState, useEffect } from 'react';
import jsyaml from 'js-yaml';
import { ControlledEditor } from '@monaco-editor/react';
import { EditorActions } from './EditorActions';

export function YamlContent({
  yaml,
  setChangedYamlFn,
  title,
  save,
  saveDisabled,
}) {
  const editorRef = React.useRef();
  const [val, setVal] = useState(jsyaml.safeDump(yaml));

  useEffect(() => {
    const converted = jsyaml.safeDump(yaml);
    setChangedYamlFn(null);
    setVal(converted);
  }, [yaml]);

  return (
    <>
      <EditorActions
        val={val}
        editor={editorRef.current}
        title={title}
        save={save}
        saveDisabled={saveDisabled}
      />
      <ControlledEditor
        height="90vh"
        language={'yaml'}
        theme="vs-light"
        value={val}
        onChange={(_, text) => setChangedYamlFn(text)}
        editorDidMount={(_, editor) => (editorRef.current = editor)}
      />
    </>
  );
}
