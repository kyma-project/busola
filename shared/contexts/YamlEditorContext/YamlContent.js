import React, { useState, useEffect } from 'react';
import jsyaml from 'js-yaml';
import { ControlledEditor } from '@monaco-editor/react';
import { EditorActions } from './EditorActions';

export function YamlContent({
  yaml,
  setChangedYamlFn,
  title,
  onSave,
  saveDisabled,
}) {
  const editorRef = React.useRef();
  const [val, setVal] = useState(jsyaml.safeDump(yaml));

  useEffect(() => {
    const converted = jsyaml.safeDump(yaml);
    setChangedYamlFn(null);
    setVal(converted);

    // close search
    editorRef.current?.trigger('', 'closeFindWidget');
  }, [yaml]);

  return (
    <>
      <EditorActions
        val={val}
        editor={editorRef.current}
        title={title}
        onSave={onSave}
        saveDisabled={saveDisabled}
      />
      <ControlledEditor
        height="85vh"
        language="yaml"
        theme="vs-light"
        value={val}
        onChange={(_, text) => setChangedYamlFn(text)}
        editorDidMount={(_, editor) => (editorRef.current = editor)}
        options={{ minimap: { enabled: false } }}
      />
    </>
  );
}
