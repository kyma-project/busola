import React, { useState, useEffect } from 'react';
import jsyaml from 'js-yaml';
import { ControlledEditor } from '@monaco-editor/react';
import { EditorActions } from './EditorActions';

import { useTheme } from '../ThemeContext';
import { ErrorBoundary } from '../../components/ErrorBoundary/ErrorBoundary';

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
  }, [yaml]);

  return (
    <>
      <EditorActions
        val={val}
        editor={editor}
        title={title}
        onSave={onSave}
        saveDisabled={saveDisabled}
        readOnly={readOnly}
        i18n={i18n}
      />
      <ErrorBoundary i18n={i18n}>
        <ControlledEditor
          height="85vh"
          language="yaml"
          theme={editorTheme}
          value={val}
          onChange={(_, text) => setChangedYamlFn(text)}
          editorDidMount={(_, editor) => setEditor(editor)}
          options={{
            minimap: { enabled: false },
            readOnly,
            scrollbar: {
              alwaysConsumeMouseWheel: false,
            },
          }}
        />
      </ErrorBoundary>
    </>
  );
}
