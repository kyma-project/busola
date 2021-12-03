import React from 'react';
import { MonacoEditor, useTheme } from 'react-shared';
import { LayoutPanel } from 'fundamental-react';

export function ReadonlyEditorPanel({ title, value, editorProps }) {
  const { editorTheme } = useTheme();

  const options = {
    readOnly: true,
    minimap: {
      enabled: false,
    },
    scrollbar: {
      alwaysConsumeMouseWheel: false,
    },
  };

  return (
    <LayoutPanel className="fd-margin--md">
      <LayoutPanel.Header>
        <LayoutPanel.Head title={title} />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        <MonacoEditor
          theme={editorTheme}
          height="20em"
          value={value}
          options={options}
          {...editorProps}
        />
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
