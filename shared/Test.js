import React from 'react';
import MonacoEditor from 'react-monaco-editor';
import 'monaco-editor';
// import './node_modules/monaco-yaml/lib/dev/monaco.contribution';// vscode-languageserver-types
import './node_modules/monaco-yaml/lib/esm/monaco.contribution'; //monaco not defined
// import './node_modules/monaco-yaml/lib/min/monaco.contribution'; // vscode-languageserver-types

export function Test() {
  const code = 'a:b';
  return (
    <MonacoEditor
      width="800"
      height="600"
      language="javascript"
      theme="vs-light"
      value={code}
      options={{}}
      onChange={console.log}
      editorDidMount={console.log}
    />
  );
}
