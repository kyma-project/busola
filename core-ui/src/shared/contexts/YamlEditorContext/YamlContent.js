import React, { useState, useEffect } from 'react';
import jsyaml from 'js-yaml';
// import MonacoEditor from '@monaco-editor/react';
import { Editor } from 'shared/components/MonacoEditorESM/Editor';
import { EditorActions } from 'shared/contexts/YamlEditorContext/EditorActions';

import { useTheme } from 'shared/contexts/ThemeContext';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';

export function YamlContent({
  yaml,
  setChangedYamlFn,
  title,
  onSave,
  saveDisabled,
  readOnly,
  i18n,
}) {
  const [editor, setEditor] = React.useState(null);
  const [val, setVal] = useState(jsyaml.dump(yaml));
  const { editorTheme } = useTheme();

  useEffect(() => {
    const converted = jsyaml.dump(yaml);
    setChangedYamlFn(null);
    setVal(converted);

    // close search
    editor?.trigger('', 'closeFindWidget');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yaml]);

  return (
    <>
      <EditorActions
        val={val}
        editor={editor}
        title={title}
        onSave={onSave}
        saveDisabled={saveDisabled}
        i18n={i18n}
      />
      <ErrorBoundary i18n={i18n}>
        <Editor
          autocompletionDisabled
          height="85vh"
          language="yaml"
          value={yaml}
          onChange={setChangedYamlFn}
          onMount={setEditor}
          readOnly={readOnly}
          options={{
            minimap: { enabled: false },
          }}
        />
      </ErrorBoundary>
    </>
  );
}
