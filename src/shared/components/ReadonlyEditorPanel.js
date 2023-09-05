import React from 'react';

import { EditorActions } from 'shared/contexts/YamlEditorContext/EditorActions';
import { Editor } from 'shared/components/MonacoEditorESM/Editor';
import { Panel, Title, Toolbar, ToolbarSpacer } from '@ui5/webcomponents-react';

export function ReadonlyEditorPanel({ title, value, editorProps, actions }) {
  const [editor, setEditor] = React.useState(null);

  const options = {
    minimap: {
      enabled: false,
    },
  };

  return (
    <Panel
      fixed
      className="fd-margin--md"
      header={
        <Toolbar>
          <Title level="H5">{title}</Title>
          {actions && (
            <>
              <ToolbarSpacer />
              {actions}
            </>
          )}
        </Toolbar>
      }
    >
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
    </Panel>
  );
}
