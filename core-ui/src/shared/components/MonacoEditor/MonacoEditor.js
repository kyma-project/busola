import { loader } from '@monaco-editor/react';
import { setupMonaco } from 'shared/utils/setupMonaco';
import Editor from '@monaco-editor/react';

setupMonaco(loader);

export const MonacoEditor = Editor;
export * from '@monaco-editor/react';
