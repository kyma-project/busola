import { Editor } from 'shared/components/MonacoEditorESM/Editor';
import { Provider } from 'jotai';
import createWebComponent from './createWebComponent';
import monacoCSS from 'monaco-editor/min/vs/editor/editor.main.css?inline';
import customCSS from 'shared/components/MonacoEditorESM/Editor.scss?inline';

const DEFAULT_OPTIONS = {};

function EditorWithJotai(props) {
  return (
    <Provider>
      <Editor {...props} />
    </Provider>
  );
}

createWebComponent(
  'monaco-editor',
  EditorWithJotai,
  {
    value: '',
    language: 'javascript',
    height: '300px',
    readOnly: false,
    placeholder: null,
    onChange: undefined,
    onMount: undefined,
    updateValueOnParentChange: undefined,
    autocompletionDisabled: false,
    onBlur: undefined,
    onFocus: undefined,
    schemaId: undefined,
    options: DEFAULT_OPTIONS,
    error: undefined,
  },
  [
    'value',
    'language',
    'height',
    'read-only',
    'placeholder',
    'on-change',
    'on-mount',
    'update-value-on-parent-change',
    'autocompletion-disabled',
    'on-blur',
    'on-focus',
    'schema-id',
    'options',
    'error',
  ],
  `${monacoCSS}\n${customCSS}`,
); // Observed attributes
