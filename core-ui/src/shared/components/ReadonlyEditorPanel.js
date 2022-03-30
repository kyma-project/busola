import React from 'react';
import { MonacoEditor } from 'shared/components/MonacoEditor/MonacoEditor';
import { useTheme } from 'shared/contexts/ThemeContext';
import { LayoutPanel } from 'fundamental-react';
import { EditorActions } from 'shared/contexts/YamlEditorContext/EditorActions';
import { useTranslation } from 'react-i18next';

export function ReadonlyEditorPanel({ title, value, editorProps, actions }) {
  const { editorTheme } = useTheme();
  const { i18n } = useTranslation();
  const [editor, setEditor] = React.useState(null);

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
        <EditorActions
          val={value}
          editor={editor}
          title={title}
          saveDisabled={true}
          readOnly={true}
          i18n={i18n}
        />
        <MonacoEditor
          theme={editorTheme}
          height="20em"
          value={value}
          options={options}
          onMount={editor => setEditor(editor)}
          {...editorProps}
        />
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
