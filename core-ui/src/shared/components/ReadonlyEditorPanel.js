import React from 'react';
import { MonacoEditor } from 'shared/components/MonacoEditor/MonacoEditor';
import { useTheme } from 'shared/contexts/ThemeContext';
import { LayoutPanel } from 'fundamental-react';

export function ReadonlyEditorPanel({ title, value, editorProps, actions }) {
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
        {actions && <LayoutPanel.Actions>{actions}</LayoutPanel.Actions>}
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
