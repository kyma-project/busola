import React from 'react';
import { useTheme } from 'shared/contexts/ThemeContext';
import { LayoutPanel } from 'fundamental-react';
import { EditorActions } from 'shared/contexts/YamlEditorContext/EditorActions';
import { useTranslation } from 'react-i18next';
import { Editor } from 'shared/components/MonacoEditorESM/Editor';

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
          i18n={i18n}
        />
        <Editor
          theme={editorTheme}
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
