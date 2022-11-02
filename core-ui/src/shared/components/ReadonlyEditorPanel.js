import React from 'react';
import { LayoutPanel } from 'fundamental-react';
import { EditorActions } from 'shared/contexts/YamlEditorContext/EditorActions';
import { Editor } from 'shared/components/MonacoEditorESM/Editor';

export function ReadonlyEditorPanel({ title, value, editorProps, actions }) {
  const [editor, setEditor] = React.useState(null);

  const options = {
    minimap: {
      enabled: false,
    },
  };

  return (
    <LayoutPanel className="fd-margin--md">
      <LayoutPanel.Header>
        <LayoutPanel.Head title={title} />
        {actions && <LayoutPanel.Actions>{actions}</LayoutPanel.Actions>}
      </LayoutPanel.Header>
      <LayoutPanel.Body>
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
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
