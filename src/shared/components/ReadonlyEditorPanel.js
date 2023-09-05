import React from 'react';

import { EditorActions } from 'shared/contexts/YamlEditorContext/EditorActions';
import { Editor } from 'shared/components/MonacoEditorESM/Editor';
import { UI5Panel } from './UI5Panel/UI5Panel';

export function ReadonlyEditorPanel({ title, value, editorProps, actions }) {
  const [editor, setEditor] = React.useState(null);

  const options = {
    minimap: {
      enabled: false,
    },
  };

  return (
    <UI5Panel
      title={title}
      content={
        <>
          <EditorActions
            val={value}
            editor={editor}
            title={title}
            saveDisabled={true}
          />
          <Editor
            height="20em"
            value={value}
            options={options}
            onMount={setEditor}
            autocompletionDisabled
            readOnly
            {...editorProps}
          />
        </>
      }
      headerActions={actions}
    />
  );
}
