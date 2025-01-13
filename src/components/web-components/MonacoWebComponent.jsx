import { Editor } from 'shared/components/MonacoEditorESM/Editor';
import { RecoilRoot } from 'recoil';
import createWebComponent from './createWebComponent';

function EditorWithRecoil(props) {
  return (
    <RecoilRoot>
      <Editor {...props} />
    </RecoilRoot>
  );
}

createWebComponent(
  'monaco-editor',
  EditorWithRecoil,
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
  ],
); // Observed attributes
