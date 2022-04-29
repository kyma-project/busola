import React from 'react';
import { MonacoEditor } from 'shared/components/MonacoEditor/MonacoEditor';
import { useTheme } from 'shared/contexts/ThemeContext';
import { LayoutPanel } from 'fundamental-react';
import { EditorActions } from 'shared/contexts/YamlEditorContext/EditorActions';
import { useTranslation } from 'react-i18next';
import Luigi from '@luigi-project/client';
import { Editor as EditorESM } from 'shared/components/MonacoEditorESM/Editor';

const isESM = Luigi.getContext().features?.MONACO_AUTOCOMPLETION?.isEnabled;
const Editor = isESM ? EditorESM : MonacoEditor;

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
          {...editorProps}
        />
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
