import React from 'react';
import { Button, MessageBox } from 'fundamental-react';
import { MonacoEditor } from './../../index';
import { useTheme } from '../ThemeContext';
import copyToCliboard from 'copy-to-clipboard';

export function ResultPanel({ result, showResult, close }) {
  const { editorTheme } = useTheme();

  const options = {
    readOnly: true,
    minimap: {
      enabled: false,
    },
  };

  return (
    <MessageBox
      type="information"
      title="Recording Result"
      actions={[
        <Button
          compact
          onClick={e => {
            e.preventDefault();
            copyToCliboard(result);
          }}
        >
          Copy
        </Button>,
        <Button compact>Close</Button>,
      ]}
      show={showResult}
      onClose={close}
    >
      <MonacoEditor
        theme={editorTheme}
        height="100%"
        value={result}
        options={options}
        language="yaml"
      />
    </MessageBox>
  );
}
